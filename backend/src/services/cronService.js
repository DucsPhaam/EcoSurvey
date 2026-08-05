/**
 * @module CronService
 * @description Quản lý các tác vụ lên lịch tự động (Cron Jobs) chạy ngầm hàng giờ trong hệ thống backend.
 * 
 * @function start
 * @description Đăng ký và khởi chạy tất cả các lịch trình công việc:
 * 1. Tự động chuyển trạng thái bài khảo sát sang 'Closed' khi quá ngày hết hạn (`end_date < NOW()`). Lịch chạy: mỗi giờ một lần (`0 * * * *`).
 * 2. Tự động kiểm tra và trao huy hiệu TOP 10 sinh viên có điểm rèn luyện cao nhất (`badgeService.checkTop10Badge()`). Lịch chạy: mỗi giờ một lần (`0 * * * *`).
 * 
 * @implementation
 * - Sử dụng thư viện `node-cron` lập biểu thức cron `0 * * * *`.
 * - Thực hiện các câu lệnh `Survey.update` và `checkTop10Badge` trong khối `try...catch` để đảm bảo lỗi ngầm không làm đứt tiến trình server.
 * 
 * @relations
 * - Đơn vị gọi: `server.js` (`backend/src/server.js` gọi `cronService.start()` khi khởi động server).
 * - Service gọi: `badgeService.js` (`checkTop10Badge`).
 * - Model tác động: `Survey` (`backend/src/models/Survey.js`).
 */
const cron = require('node-cron');
const { Op } = require('sequelize');
const { Survey } = require('../models');
const logger = require('../utils/logger');

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
