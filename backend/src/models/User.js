/**
 * @module UserModel
 * @description Định nghĩa lược đồ dữ liệu người dùng (Bảng `users`) trong CSDL, hỗ trợ đăng nhập cục bộ & Google OAuth, lưu trữ thông tin cá nhân, phân quyền vai trò và trạng thái tài khoản.
 * 
 * @implementation
 * - Bước 1: Khai báo định dạng thuộc tính `User` bằng Sequelize DataTypes.
 * - Bước 2: Định nghĩa các cột chính: `id`, `full_name`, `username`, `email`, `password_hash`, `role` ('Student','Staff','Admin'), `status` ('Pending','Approved','Rejected','Deactivated').
 * - Bước 3: Định nghĩa các trường hỗ trợ OAuth: `auth_provider`, `google_id`.
 * - Bước 4: Định nghĩa các trường thông tin sinh viên/cán bộ: `student_staff_id`, `class_name`, `department`, `avatar_url`, `ui_theme`.
 * - Bước 5: Định nghĩa các trường quản lý xác thực: `email_verified`, `email_verify_token`, `reset_password_token`, `reset_password_expires`.
 * - Bước 6: Tạo chỉ mục (indexes) trên các cột thường được lọc: `role` và `status`.
 * 
 * @relations
 * - Controller liên quan: `authController.js`, `adminController.js`, `userController.js`.
 * - Service liên quan: `badgeService.js`, `emailService.js`.
 * - Các bảng liên kết: `Survey`, `SurveyResponse`, `Participation`, `PointLog`, `Notification`, `Badge`, `RefreshToken`.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('users', {
  id:               { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  full_name:        { type: DataTypes.STRING(150), allowNull: false },
  username:         { type: DataTypes.STRING(80),  allowNull: false, unique: true },
  email:            { type: DataTypes.STRING(191), allowNull: false, unique: true },
  password_hash:    { type: DataTypes.STRING(255), allowNull: true },
  auth_provider:    { type: DataTypes.ENUM('local', 'google'), defaultValue: 'local' },
  google_id:        { type: DataTypes.STRING(255), allowNull: true, unique: true },
  role:             { type: DataTypes.ENUM('Student','Staff','Admin'), defaultValue: 'Student' },
  status:           { type: DataTypes.ENUM('Pending','Approved','Rejected','Deactivated'), defaultValue: 'Pending' },
  student_staff_id: { type: DataTypes.STRING(30),  allowNull: true },
  class_name:       { type: DataTypes.STRING(100), allowNull: true },
  department:       { type: DataTypes.STRING(150), allowNull: true },
  joined_date:      { type: DataTypes.DATEONLY,    allowNull: true },
  ui_theme:         { type: DataTypes.ENUM('light','dark'), defaultValue: 'light' },
  avatar_url:       { type: DataTypes.STRING(500), allowNull: true },
  reject_reason:    { type: DataTypes.TEXT,        allowNull: true },
  email_verified:           { type: DataTypes.BOOLEAN,     defaultValue: false },
  email_verify_token:       { type: DataTypes.STRING(255), allowNull: true },
  reset_password_token:     { type: DataTypes.STRING(255), allowNull: true },
  reset_password_expires:   { type: DataTypes.DATE,        allowNull: true },
}, {
  indexes: [{ fields: ['role'] }, { fields: ['status'] }],
});

module.exports = User;
