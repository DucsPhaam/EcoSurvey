const { Op, literal, fn, col } = require('sequelize');
const { sequelize } = require('../config/database');
const { User, Survey, SurveyResponse, Participation, PointLog } = require('../models');
const logger = require('../utils/logger');

// GET /api/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const userId   = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'Admin') {
      return exports.getAdminDashboard(req, res);
    }

    // Student / Staff dashboard
    const [
      surveyStats,
      participationStats,
      totalPoints,
      recentActivity,
    ] = await Promise.all([
      // Surveys completed vs available
      SurveyResponse.count({ where: { user_id: userId } }),
      // Participation reports grouped by status
      Participation.findAll({
        where: { user_id: userId },
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
      // Total points
      PointLog.sum('points', { where: { user_id: userId } }),
      // Recent point activity
      PointLog.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 5,
      }),
    ]);

    // FIX #11 & #14: Tính rank bằng SQL subquery — nhất quán với leaderboard (period=all)
    // và không load toàn bộ bảng point_logs vào bộ nhớ
    const myPoints = totalPoints || 0;
    let rank = null;
    if (myPoints > 0) {
      const rankResult = await sequelize.query(
        `SELECT COUNT(*) + 1 AS rank
         FROM (
           SELECT pl.user_id, SUM(pl.points) AS total_points
           FROM point_logs pl
           INNER JOIN users u ON u.id = pl.user_id AND u.status = 'Approved'
           GROUP BY pl.user_id
         ) AS ranked
         WHERE ranked.total_points > :myPoints`,
        { replacements: { myPoints }, type: sequelize.QueryTypes.SELECT }
      );
      rank = parseInt(rankResult[0]?.rank || 1);
    }

    // Available surveys count (chỉ tính đã mở và chưa hết hạn)
    const now = new Date();
    const availableSurveys = await Survey.count({
      where: {
        status:     'Published',
        start_date: { [Op.lte]: now },
        end_date:   { [Op.gte]: now },
        [Op.or]: [{ target_role: 'All' }, { target_role: userRole }],
      },
    });

    res.json({
      role: userRole,
      surveys_completed:   surveyStats,
      surveys_available:   availableSurveys,
      participation_stats: participationStats,
      total_points:        myPoints,
      rank:                rank,
      recent_activity:     recentActivity,
    });
  } catch (err) {
    logger.error('getDashboard error:', err);
    res.status(500).json({ message: 'Failed to load dashboard.' });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400 * 1000);

    const [
      totalUsers,
      usersByRole,
      usersByStatus,
      totalSurveys,
      surveysByStatus,
      recentResponses,
      pendingParticipations,
      chartData,
    ] = await Promise.all([
      User.count(),
      User.findAll({
        attributes: ['role', [fn('COUNT', col('id')), 'count']],
        group: ['role'], raw: true,
      }),
      User.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'], raw: true,
      }),
      Survey.count(),
      Survey.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'], raw: true,
      }),
      SurveyResponse.count({ where: { submitted_at: { [Op.gte]: sevenDaysAgo } } }),
      Participation.count({ where: { status: 'Pending' } }),
      // Daily participation chart (last 7 days)
      SurveyResponse.findAll({
        attributes: [
          [fn('DATE', col('submitted_at')), 'date'],
          [fn('COUNT', col('id')), 'count'],
        ],
        where: { submitted_at: { [Op.gte]: sevenDaysAgo } },
        group: [fn('DATE', col('submitted_at'))],
        order: [[fn('DATE', col('submitted_at')), 'ASC']],
        raw: true,
      }),
    ]);

    res.json({
      role:                   'Admin',
      total_users:             totalUsers,
      users_by_role:           usersByRole,
      users_by_status:         usersByStatus,
      total_surveys:           totalSurveys,
      surveys_by_status:       surveysByStatus,
      recent_responses_7d:     recentResponses,
      pending_participations:  pendingParticipations,
      chart_daily_responses:   chartData,
    });
  } catch (err) {
    logger.error('getAdminDashboard error:', err);
    res.status(500).json({ message: 'Failed to load admin dashboard.' });
  }
};
