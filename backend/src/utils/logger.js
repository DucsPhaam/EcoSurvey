/**
 * @module SystemLogger
 * @description Bộ ghi log hệ thống tập trung xây dựng trên thư viện Winston, định dạng mốc thời gian và hiển thị màu sắc trên Console.
 * 
 * @implementation
 * - Bước 1: Xác định cấp độ ghi log (log level): 'info' cho môi trường production, 'debug' cho môi trường khác.
 * - Bước 2: Định dạng dữ liệu log kết hợp: timestamp `YYYY-MM-DD HH:mm:ss`, format lỗi có stack trace, và in tiền tố cấp độ log ([INFO], [ERROR], [DEBUG]).
 * - Bước 3: Đăng ký transport ghi ra màn hình Console có tô màu nhãn log.
 * 
 * @relations
 * - Tất cả các controller, service, middleware trong backend (`adminController`, `authController`, `database.js`, `cronService.js`, v.v.) import và sử dụng `logger.info()`, `logger.error()`, `logger.warn()`, `logger.debug()`.
 */
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) =>
      stack
        ? `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`
        : `[${timestamp}] ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) =>
          `[${timestamp}] ${level}: ${message}`
        )
      ),
    }),
  ],
});

module.exports = logger;
