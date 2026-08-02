/**
 * @module ParticipationModel
 * @description Định nghĩa lược đồ nộp minh chứng hoạt động ngoại khóa / bảo vệ môi trường (Bảng `participations`).
 * 
 * @implementation
 * - Bước 1: Khai báo khóa ngoại `user_id` (người nộp minh chứng).
 * - Bước 2: Khai báo thông tin sự kiện: `event_name`, `location`, `participant_count`, `description`.
 * - Bước 3: Đặt trạng thái duyệt `status` ('Pending','Approved','Rejected').
 * - Bước 4: Khai báo các cột tóm tắt AI `ai_summary`, lý do từ chối `reject_reason`, thông tin người duyệt `reviewed_by` và thời điểm duyệt `reviewed_at`.
 * - Bước 5: Tạo chỉ mục tìm kiếm tối ưu cho `user_id` và `status`.
 * 
 * @relations
 * - Controller liên quan: `participationController.js`, `adminController.js`, `aiController.js`.
 * - Service liên quan: `aiService.js` (tự động phân tích minh chứng), `badgeService.js` (cộng điểm/trao huy hiệu khi Approved).
 * - Các bảng liên kết: `User` (người nộp & Admin duyệt), `ParticipationFile` (danh sách tệp đính kèm).
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Participation = sequelize.define('participations', {
  id:                { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id:           { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  event_name:        { type: DataTypes.STRING(255), allowNull: false },
  location:          { type: DataTypes.STRING(255), allowNull: false },
  participant_count: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  description:       { type: DataTypes.TEXT, allowNull: false },
  status:            { type: DataTypes.ENUM('Pending','Approved','Rejected'), defaultValue: 'Pending' },
  ai_summary:        { type: DataTypes.TEXT, allowNull: true },
  reject_reason:     { type: DataTypes.TEXT, allowNull: true },
  reviewed_by:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  reviewed_at:       { type: DataTypes.DATE, allowNull: true },
}, {
  indexes: [{ fields: ['user_id'] }, { fields: ['status'] }],
});

module.exports = Participation;
