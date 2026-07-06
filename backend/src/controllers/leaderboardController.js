const { Op, fn, col, literal } = require('sequelize');
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

    const top10 = await PointLog.findAll({
      where,
      attributes: ['user_id', [fn('SUM', col('points')), 'total_points']],
      include: [{
        model: User, as: 'user',
        attributes: ['id', 'full_name', 'username', 'avatar_url', 'role'],
      }],
      group: ['user_id', 'user.id', 'user.full_name', 'user.username', 'user.avatar_url', 'user.role'],
      order: [[literal('total_points'), 'DESC']],
      limit: 10,
      raw: false,
    });

    // Current user's rank (if not in top 10)
    const userId = req.user.id;
    const allRanks = await PointLog.findAll({
      where,
      attributes: ['user_id', [fn('SUM', col('points')), 'total_points']],
      group: ['user_id'],
      order: [[literal('total_points'), 'DESC']],
      raw: true,
    });

    const myRankIndex = allRanks.findIndex((r) => parseInt(r.user_id) === userId);
    const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;
    const myPoints = myRankIndex >= 0 ? parseInt(allRanks[myRankIndex].total_points) : 0;

    const leaderboard = top10.map((entry, index) => ({
      rank:         index + 1,
      user_id:      entry.user_id,
      full_name:    entry.user?.full_name,
      username:     entry.user?.username,
      avatar_url:   entry.user?.avatar_url,
      role:         entry.user?.role,
      total_points: parseInt(entry.get('total_points')),
    }));

    res.json({ leaderboard, my_rank: myRank, my_points: myPoints, total_participants: allRanks.length, period });
  } catch (err) {
    logger.error('getLeaderboard error:', err);
    res.status(500).json({ message: 'Failed to fetch leaderboard.' });
  }
};
