// Rate limiter middleware: Controls request rate limits to prevent brute-force attacks and spam.
const rateLimit = require('express-rate-limit');

// Strict login rate limiter to prevent brute-force attacks.
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '10', 10),
  message: { message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 1 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Gemini AI API rate limiter to control API quota and costs.
const aiLimiter = rateLimit({
  windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.AI_RATE_LIMIT_MAX || '10', 10),
  message: { message: 'Bạn đã gửi quá nhiều câu hỏi. Vui lòng đợi 1 phút.' },
  keyGenerator: (req) => req.user?.id?.toString() || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter to protect the entire backend server.
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Survey submission rate limiter to prevent spam.
const surveySubmitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.SURVEY_SUBMIT_RATE_LIMIT_MAX || '5', 10),
  message: { message: 'Bạn nộp bài quá nhanh. Vui lòng đợi 1 phút.' },
  keyGenerator: (req) => req.user?.id?.toString() || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, aiLimiter, generalLimiter, surveySubmitLimiter };
