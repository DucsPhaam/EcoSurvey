/**
 * @module SequelizeConfig
 * @description Tệp cấu hình kết nối cơ sở dữ liệu MySQL cho Sequelize CLI và Sequelize ORM theo từng môi trường.
 * 
 * @implementation
 * - Bước 1: Nạp tệp cấu hình môi trường `.env` ở thư mục gốc của backend.
 * - Bước 2: Xuất đối tượng chứa cấu hình cho 3 môi trường: `development`, `test`, và `production`.
 * - Bước 3: Đặt các tham số kết nối mặc định (username, password, database, host, port, dialect) đi kèm cấu hình múi giờ UTC (`+00:00`).
 * 
 * @relations
 * - CLI sử dụng: `.sequelizerc`, Sequelize CLI thực hiện migrations/seeders.
 * - ORM sử dụng: `backend/src/config/database.js` và `backend/src/models/index.js`.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345678',
    database: process.env.DB_NAME || 'ecosurvey',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    timezone: '+00:00'
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345678',
    database: process.env.DB_NAME || 'ecosurvey_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    timezone: '+00:00'
  },
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345678',
    database: process.env.DB_NAME || 'ecosurvey_prod',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    timezone: '+00:00'
  }
};
