/**
 * @module PointLogModel
 * @description Định nghĩa lược đồ lịch sử biến động điểm rèn luyện / tích lũy của sinh viên (Bảng `point_logs`).
 * 
 * @implementation
 * - Bước 1: Khai báo `user_id` sở hữu lượt cộng/trừ điểm.
 * - Bước 2: Khai báo loại hành động `action_type` ('Survey_Completion','Event_Report','Bonus','Deduction').
 * - Bước 3: Đặt số điểm biến động `points` (âm hoặc dương).
 * - Bước 4: Lưu thông tin tham chiếu `reference_id`, `reference_type` và ghi chú `note`.
 * - Bước 5: Tắt `updatedAt` và chỉ mục theo `user_id`, `created_at`.
 * 
 * @relations
 * - Controller/Service liên quan: `surveyController.js`, `participationController.js`, `leaderboardController.js`, `badgeService.js`.
 * - Các bảng liên kết: `User`.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PointLog = sequelize.define('point_logs', {
  id:             { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id:        { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  action_type:    { type: DataTypes.ENUM('Survey_Completion','Event_Report','Bonus','Deduction'), allowNull: false },
  points:         { type: DataTypes.INTEGER, defaultValue: 0 },
  reference_id:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  reference_type: { type: DataTypes.STRING(50), allowNull: true },
  note:           { type: DataTypes.STRING(255), allowNull: true },
}, {
  updatedAt: false,
  indexes: [{ fields: ['user_id'] }, { fields: ['created_at'] }],
});

module.exports = PointLog;
