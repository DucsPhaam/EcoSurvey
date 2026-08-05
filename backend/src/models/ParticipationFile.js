/**
 * @module ParticipationFileModel
 * @description Định nghĩa lược đồ các tệp đính kèm hình ảnh/tài liệu minh chứng (Bảng `participation_files`).
 * 
 * @implementation
 * - Bước 1: Khai báo khóa ngoại `participation_id` (liên kết với bảng `participations`).
 * - Bước 2: Khai báo các cột đường dẫn `file_url`, tên gốc `file_name`, định dạng `file_type` và dung lượng `file_size`.
 * - Bước 3: Tắt `updatedAt` và chỉ đánh chỉ mục tìm kiếm theo `participation_id`.
 * 
 * @relations
 * - Controller liên quan: `participationController.js`, `fileController.js`.
 * - Các bảng liên kết: `Participation`.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ParticipationFile = sequelize.define('participation_files', {
  id:               { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  participation_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  file_url:         { type: DataTypes.STRING(500), allowNull: false },
  file_name:        { type: DataTypes.STRING(255), allowNull: false },
  file_type:        { type: DataTypes.STRING(100), allowNull: true },
  file_size:        { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, {
  updatedAt: false,
  indexes: [{ fields: ['participation_id'] }],
});

module.exports = ParticipationFile;
