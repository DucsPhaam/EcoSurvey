const cron = require('node-cron');
const { Op } = require('sequelize');
const { Survey } = require('../models');
const logger = require('../utils/logger');

/**
 * Cron job: Auto-close surveys that have passed their end_date.
 * Runs every hour.
 */
const start = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const [updated] = await Survey.update(
        { status: 'Closed' },
        {
          where: {
            status: 'Published',
            end_date: { [Op.lt]: new Date() },
          },
        }
      );
      if (updated > 0) {
        logger.info(`[Cron] Auto-closed ${updated} expired survey(s).`);
      }
    } catch (err) {
      logger.error('[Cron] Failed to auto-close surveys:', err.message);
    }
  });

  cron.schedule('0 * * * *', async () => {
    try {
      const badgeService = require('./badgeService');
      await badgeService.checkTop10Badge();
      logger.info(`[Cron] Top 10 badge check completed.`);
    } catch (err) {
      logger.error('[Cron] Failed to check Top 10 badges:', err.message);
    }
  });

  logger.info('✅ Cron jobs started (survey auto-close: every hour, top 10 badges: every hour)');
};

module.exports = { start };
