/**
 * @module RefreshTokenModel
 * @description Định nghĩa lược đồ lưu vết JWT Refresh Token trong CSDL (Bảng `refresh_tokens`), hỗ trợ duy trì phiên đăng nhập và gia hạn Access Token an toàn.
 * 
 * @implementation
 * - Bước 1: Khai báo khóa ngoại `user_id` sở hữu token.
 * - Bước 2: Lưu chuỗi hash mã hóa của Refresh Token `token_hash` (đảm bảo tính độc nhất với `unique: true`).
 * - Bước 3: Đặt thời gian hết hạn `expires_at` và cờ hủy phiên `revoked`.
 * - Bước 4: Tắt `updatedAt`.
 * 
 * @relations
 * - Controller liên quan: `authController.js` (`refreshToken`, `logout`, `login`).
 * - Middleware liên quan: `authMiddleware.js`.
 * - Các bảng liên kết: `User`.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RefreshToken = sequelize.define('refresh_tokens', {
  id:         { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  token_hash: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  revoked:    { type: DataTypes.BOOLEAN, defaultValue: false },
}, { updatedAt: false });

module.exports = RefreshToken;
