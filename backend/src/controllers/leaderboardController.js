const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/database');
const { PointLog, User } = require('../models');
const logger = require('../utils/logger');

// GET /api/leaderboard?period=week|month|all
exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const where = {};

    if (period === 'week') {
      where.created_at = { [Op.gte]: new Date(Date.now() - 7 * 86400 * 1000) };
    } else if (period === 'month') {
      where.created_at = { [Op.gte]: new Date(Date.now() - 30 * 86400 * 1000) };
    }

    // FIX #10: Chỉ hiển thị user có status = 'Approved'
    const top10 = await PointLog.findAll({
      where,
      attributes: ['user_id', [fn('SUM', col('points')), 'total_points']],
      include: [{
        model: User, as: 'user',
        attributes: ['id', 'full_name', 'username', 'avatar_url', 'role'],
        // FIX #10: Lọc user Approved — user bị Rejected/Deactivated không xuất hiện trên leaderboard
        where: { status: 'Approved' },
        required: true,
      }],
      group: ['user_id', 'user.id', 'user.full_name', 'user.username', 'user.avatar_url', 'user.role'],
      order: [[literal('total_points'), 'DESC']],
      limit: 10,
      raw: false,
    });

    // FIX #14: Tính rank của user hiện tại bằng SQL subquery thay vì load toàn bộ bảng
    // Cách cũ: findAll() toàn bộ PointLog rồi findIndex() → O(N) trong JS
    // Cách mới: COUNT SQL trực tiếp → O(1) về mặt ứng dụng
    const userId = req.user.id;

    const periodCondition = period === 'week'
      ? `AND pl.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
      : period === 'month'
      ? `AND pl.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      : '';

    // Lấy điểm của user hiện tại
    const myPointsResult = await sequelize.query(
      `SELECT COALESCE(SUM(pl.points), 0) AS my_points
       FROM point_logs pl
       WHERE pl.user_id = :userId ${periodCondition}`,
      { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
    );
    const myPoints = parseInt(myPointsResult[0]?.my_points || 0);

    // Đếm số user có tổng điểm cao hơn user hiện tại (chỉ tính Approved users)
    const rankResult = await sequelize.query(
      `SELECT COUNT(*) + 1 AS rank
       FROM (
         SELECT pl.user_id, SUM(pl.points) AS total_points
         FROM point_logs pl
         INNER JOIN users u ON u.id = pl.user_id AND u.status = 'Approved'
         WHERE 1=1 ${periodCondition}
         GROUP BY pl.user_id
       ) AS ranked
       WHERE ranked.total_points > :myPoints`,
      { replacements: { userId, myPoints }, type: sequelize.QueryTypes.SELECT }
    );
    const myRank = myPoints > 0 ? parseInt(rankResult[0]?.rank || 1) : null;

    // Tổng số người tham gia (có điểm, đã Approved)
    const totalResult = await sequelize.query(
      `SELECT COUNT(DISTINCT pl.user_id) AS total
       FROM point_logs pl
       INNER JOIN users u ON u.id = pl.user_id AND u.status = 'Approved'
       WHERE 1=1 ${periodCondition}`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const totalParticipants = parseInt(totalResult[0]?.total || 0);

    const leaderboard = top10.map((entry, index) => ({
      rank:         index + 1,
      user_id:      entry.user_id,
      full_name:    entry.user?.full_name,
      username:     entry.user?.username,
      avatar_url:   entry.user?.avatar_url,
      role:         entry.user?.role,
      total_points: parseInt(entry.get('total_points')),
    }));

    res.json({ leaderboard, my_rank: myRank, my_points: myPoints, total_participants: totalParticipants, period });
  } catch (err) {
    logger.error('getLeaderboard error:', err);
    res.status(500).json({ message: 'Failed to fetch leaderboard.' });
  }
};
