// Leaderboard controller: Calculates training point rankings (Top 10, personal rank, weekly/monthly/all-time totals).
const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/database');
const { PointLog, User } = require('../models');
const logger = require('../utils/logger');

exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const where = {};

    if (period === 'week') {
      where.created_at = { [Op.gte]: new Date(Date.now() - 7 * 86400 * 1000) };
    } else if (period === 'month') {
      where.created_at = { [Op.gte]: new Date(Date.now() - 30 * 86400 * 1000) };
    }

    const top10 = await PointLog.findAll({
      where,
      attributes: ['user_id', [fn('SUM', col('points')), 'total_points']],
      include: [{
        model: User, as: 'user',
        attributes: ['id', 'full_name', 'username', 'avatar_url', 'role'],
        where: { status: 'Approved' },
        required: true,
      }],
      group: ['user_id', 'user.id', 'user.full_name', 'user.username', 'user.avatar_url', 'user.role'],
      order: [[literal('total_points'), 'DESC']],
      limit: 10,
      raw: false,
    });

    const userId = req.user.id;

    const periodCondition = period === 'week'
      ? `AND pl.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
      : period === 'month'
        ? `AND pl.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
        : '';

    const myPointsResult = await sequelize.query(
      `SELECT COALESCE(SUM(pl.points), 0) AS my_points
       FROM point_logs pl
       WHERE pl.user_id = :userId ${periodCondition}`,
      { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
    );
    const myPoints = parseInt(myPointsResult[0]?.my_points || 0);

    const rankResult = await sequelize.query(
      `SELECT COUNT(*) + 1 AS user_rank
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
    const myRank = myPoints > 0 ? parseInt(rankResult[0]?.user_rank || 1) : null;

    const totalResult = await sequelize.query(
      `SELECT COUNT(DISTINCT pl.user_id) AS total
       FROM point_logs pl
       INNER JOIN users u ON u.id = pl.user_id AND u.status = 'Approved'
       WHERE 1=1 ${periodCondition}`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const totalParticipants = parseInt(totalResult[0]?.total || 0);

    const leaderboard = top10.map((entry, index) => ({
      rank: index + 1,
      user_id: entry.user_id,
      full_name: entry.user?.full_name,
      username: entry.user?.username,
      avatar_url: entry.user?.avatar_url,
      role: entry.user?.role,
      total_points: parseInt(entry.get('total_points')),
    }));

    res.json({ leaderboard, my_rank: myRank, my_points: myPoints, total_participants: totalParticipants, period });
  } catch (err) {
    logger.error('getLeaderboard error:', err);
    res.status(500).json({ message: 'Failed to fetch leaderboard.' });
  }
};