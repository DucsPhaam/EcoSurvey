// Gamification badge service: Automatically checks user eligibility and unlocks badges based on completed surveys, approved proofs, points, or rankings.
const { Badge, UserBadge, SurveyResponse, Participation, PointLog, User, Notification } = require('../models');
const { getIo } = require('./socketService');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

exports.checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) return;

    const earnedBadges = await UserBadge.findAll({ where: { user_id: userId }, attributes: ['badge_id'] });
    const earnedBadgeIds = earnedBadges.map(ub => ub.badge_id);
    
    const unearnedBadges = await Badge.findAll({
      where: {
        id: { [Op.notIn]: earnedBadgeIds }
      }
    });

    if (unearnedBadges.length === 0) return;

    const surveyCount = await SurveyResponse.count({ where: { user_id: userId } });
    const participationCount = await Participation.count({ where: { user_id: userId, status: 'Approved' } });
    const totalPoints = await PointLog.sum('points', { where: { user_id: userId } }) || 0;

    const newlyEarned = [];

    for (const badge of unearnedBadges) {
      let isEarned = false;

      switch (badge.condition_type) {
        case 'SURVEY_COUNT':
          isEarned = surveyCount >= badge.condition_value;
          break;
        case 'PARTICIPATION_COUNT':
          isEarned = participationCount >= badge.condition_value;
          break;
        case 'TOTAL_POINTS':
          isEarned = totalPoints >= badge.condition_value;
          break;
        default:
          break;
      }

      if (isEarned) {
        newlyEarned.push(badge);
      }
    }

    for (const badge of newlyEarned) {
      await UserBadge.create({ user_id: userId, badge_id: badge.id });
      
      await Notification.create({
        user_id: userId,
        title: 'Bạn nhận được huy hiệu mới!',
        message: `Chúc mừng bạn đã mở khóa huy hiệu "${badge.name}" ${badge.icon_emoji}`,
        type: 'System',
        is_read: false
      });

      const io = getIo();
      if (io) {
        io.to(`user_${userId}`).emit('new_badge', {
          badge: badge
        });
        io.to(`user_${userId}`).emit('new_notification');
      }
      
      logger.info(`User ${userId} earned badge ${badge.id} (${badge.name})`);
    }

  } catch (error) {
    logger.error('Error checking and awarding badges:', error);
  }
};

exports.checkTop10Badge = async () => {
  try {
    const top10Badge = await Badge.findOne({ where: { condition_type: 'LEADERBOARD_RANK', condition_value: 10 } });
    if (!top10Badge) return;

    const topUsers = await PointLog.findAll({
      attributes: ['user_id', [PointLog.sequelize.fn('SUM', PointLog.sequelize.col('points')), 'total_points']],
      group: ['user_id'],
      order: [[PointLog.sequelize.fn('SUM', PointLog.sequelize.col('points')), 'DESC']],
      limit: 10,
    });

    for (const userStat of topUsers) {
      const userId = userStat.user_id;
      
      const existing = await UserBadge.findOne({ where: { user_id: userId, badge_id: top10Badge.id } });
      if (!existing) {
        await UserBadge.create({ user_id: userId, badge_id: top10Badge.id });
        
        await Notification.create({
          user_id: userId,
          title: 'Bạn nhận được huy hiệu mới!',
          message: `Chúc mừng bạn đã mở khóa huy hiệu "${top10Badge.name}" ${top10Badge.icon_emoji}`,
          type: 'System',
          is_read: false
        });

        const io = getIo();
        if (io) {
          io.to(`user_${userId}`).emit('new_badge', { badge: top10Badge });
          io.to(`user_${userId}`).emit('new_notification');
        }
        
        logger.info(`User ${userId} earned Top 10 badge`);
      }
    }
  } catch (error) {
    logger.error('Error checking Top 10 badges:', error);
  }
};
