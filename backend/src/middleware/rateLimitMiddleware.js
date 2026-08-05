/**
 * @module RateLimitMiddleware
 * @description Các cấu hình giới hạn tần suất yêu cầu (Rate Limiting) giúp ngăn chặn tấn công dò mật khẩu (Brute-force), ngăn spam nộp bài và kiểm soát chi phí gọi API AI.
 * 
 * @constant loginLimiter
 * @description Giới hạn lượt đăng nhập thất bại chống brute-force (Mặc định 10 lần / phút).
 * 
 * @constant aiLimiter
 * @description Giới hạn lượt gọi API Gemini AI theo từng tài khoản người dùng hoặc IP (Mặc định 10 lượt / phút).
 * 
 * @constant generalLimiter
 * @description Giới hạn lượt gọi API chung cho toàn hệ thống (Mặc định 300 lượt / phút).
 * 
 * @constant surveySubmitLimiter
 * @description Giới hạn tần suất nộp bài khảo sát chống gửi lặp bài ngẫu nhiên (Mặc định 5 lượt / phút).
 * 
 * @relations
 * - `authRoutes.js`: Áp dụng `loginLimiter` cho `/api/auth/login`.
 * - `aiRoutes.js` & `faqPublicRoutes.js`: Áp dụng `aiLimiter` cho các endpoint tư vấn AI Chatbot.
 * - `surveyRoutes.js`: Áp dụng `surveySubmitLimiter` cho endpoint nộp khảo sát.
 */
const rateLimit = require('express-rate-limit');

/**
 * Giới hạn đăng nhập nghiêm ngặt chống tấn công brute-force
 */
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '10', 10),
  message: { message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 1 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Giới hạn gọi API Gemini AI nhằm kiểm soát chi phí quota API
 */
const aiLimiter = rateLimit({
  windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.AI_RATE_LIMIT_MAX || '10', 10),
  message: { message: 'Bạn đã gửi quá nhiều câu hỏi. Vui lòng đợi 1 phút.' },
  keyGenerator: (req) => req.user?.id?.toString() || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Giới hạn chung bảo vệ toàn bộ API server
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Giới hạn tần suất nộp khảo sát chống spam dữ liệu rác
 */
const surveySubmitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.SURVEY_SUBMIT_RATE_LIMIT_MAX || '5', 10),
  message: { message: 'Bạn nộp bài quá nhanh. Vui lòng đợi 1 phút.' },
  keyGenerator: (req) => req.user?.id?.toString() || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, aiLimiter, generalLimiter, surveySubmitLimiter };
