/**
 * @module DatabaseConnection
 * @description Đơn vị khởi tạo kết nối Sequelize ORM chính của ứng dụng backend kết nối với cơ sở dữ liệu MySQL.
 * 
 * @implementation
 * - Bước 1: Trích xuất thông tin kết nối từ biến môi trường (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT).
 * - Bước 2: Cấu hình `timezone: '+00:00'` để lưu trữ tất cả mốc thời gian DATETIME chuẩn UTC.
 * - Bước 3: Đăng ký logger chuyển hướng truy vấn SQL sang Winston logger với level debug.
 * - Bước 4: Thiết lập Connection Pool (tối đa 10 kết nối, thời gian chờ tối đa 30s) và định dạng tên bảng/tột chuẩn hóa (`created_at`, `updated_at`).
 * - Bước 5: Xuất thể hiện `sequelize` và lớp `Sequelize`.
 * 
 * @relations
 * - Mô hình dữ liệu: Được nạp tại `backend/src/models/index.js` để định nghĩa tất cả các Sequelize Model.
 * - Đơn vị khởi tạo server: `backend/src/server.js` sử dụng `sequelize.authenticate()` để kiểm tra kết nối DB trước khi lắng nghe cổng HTTP.
 */
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecosurvey',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '12345678',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    timezone: '+00:00', // Always store/read DATETIME as UTC
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: false,
      freezeTableName: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = { sequelize, Sequelize };
