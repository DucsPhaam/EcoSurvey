/**
 * @module UserBadgeModel
 * @description Bảng trung gian lưu vết danh hiệu/huy hiệu mà người dùng đã đạt được (Bảng `user_badges`).
 * 
 * @implementation
 * - Bước 1: Khai báo khóa ngoại `user_id` và `badge_id`.
 * - Bước 2: Lưu mốc thời gian đạt huy hiệu `earned_at`.
 * - Bước 3: Đặt chỉ mục duy nhất `unique: true` cho cặp `['user_id', 'badge_id']` để đảm bảo người dùng chỉ nhận 1 huy hiệu cùng loại 1 lần.
 * 
 * @relations
 * - Service liên quan: `badgeService.js`.
 * - Models liên quan: `User`, `Badge`.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserBadge = sequelize.define('user_badges', {
  id:               { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id:          { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  badge_id:         { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  earned_at:        { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false,
  indexes: [
    { unique: true, fields: ['user_id', 'badge_id'] }
  ]
});

module.exports = UserBadge;
