/**
 * @module NotificationModel
 * @description Định nghĩa lược đồ thông báo dành cho người dùng (Bảng `notifications`), hỗ trợ phát thông báo trực tiếp & qua Socket.IO.
 * 
 * @implementation
 * - Bước 1: Khai báo `user_id` sở hữu thông báo.
 * - Bước 2: Khai báo `title` tiêu đề và `message` nội dung thông báo.
 * - Bước 3: Đặt trạng thái đã đọc `is_read` (mặc định false).
 * - Bước 4: Khai báo tham chiếu đến nguồn phát thông báo: `reference_type` ('Survey', 'Participation', v.v.) và `reference_id`.
 * - Bước 5: Tắt `updatedAt` và chỉ mục theo `user_id`, `is_read`.
 * 
 * @relations
 * - Controller/Service liên quan: `notificationController.js`, `socketService.js`, `adminController.js`, `surveyController.js`.
 * - Các bảng liên kết: `User`.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('notifications', {
  id:             { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id:        { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  title:          { type: DataTypes.STRING(255), allowNull: false },
  message:        { type: DataTypes.TEXT, allowNull: false },
  is_read:        { type: DataTypes.BOOLEAN, defaultValue: false },
  reference_type: { type: DataTypes.STRING(50), allowNull: true },
  reference_id:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, {
  updatedAt: false,
  indexes: [{ fields: ['user_id'] }, { fields: ['is_read'] }],
});

module.exports = Notification;
