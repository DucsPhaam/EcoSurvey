/**
 * @module BadgeModel
 * @description Định nghĩa lược đồ các danh hiệu / huy hiệu thưởng (Bảng `badges`) trong hệ thống Gamification của EcoSurvey.
 * 
 * @implementation
 * - Bước 1: Khai báo tên huy hiệu `name`, biểu tượng `icon_emoji`, và mô tả ngắn `description`.
 * - Bước 2: Khai báo loại điều kiện đạt huy hiệu `condition_type` ('SURVEY_COUNT', 'PARTICIPATION_COUNT', 'TOTAL_POINTS', 'LEADERBOARD_RANK', v.v.).
 * - Bước 3: Đặt giá trị ngưỡng điều kiện `condition_value` (ví dụ: hoàn thành 5 khảo sát, đạt 100 điểm, v.v.).
 * - Bước 4: Tắt timestamps.
 * 
 * @relations
 * - Service liên quan: `badgeService.js` (kiểm tra và tự động mở khóa huy hiệu cho người dùng).
 * - Controllers: `dashboardController.js`, `userController.js`.
 * - Bảng trung gian liên kết: `UserBadge` <-> `User`.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Badge = sequelize.define('badges', {
  id:               { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name:             { type: DataTypes.STRING(100), allowNull: false },
  icon_emoji:       { type: DataTypes.STRING(20), allowNull: false },
  description:      { type: DataTypes.STRING(255), allowNull: false },
  condition_type:   { type: DataTypes.ENUM('SURVEY_COUNT', 'PARTICIPATION_COUNT', 'TOTAL_POINTS', 'LEADERBOARD_RANK', 'ECO_SURVEY_COUNT', 'HIGH_RATING_COUNT'), allowNull: false },
  condition_value:  { type: DataTypes.INTEGER, allowNull: false },
}, {
  timestamps: false,
});

module.exports = Badge;
