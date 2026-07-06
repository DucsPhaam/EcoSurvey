const rateLimit = require('express-rate-limit');

/**
 * Strict rate limit for login endpoint — anti brute-force
 */
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '10', 10),
  message: { message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limit for AI endpoints — cost control
 */
const aiLimiter = rateLimit({
  windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 min
  max: parseInt(process.env.AI_RATE_LIMIT_MAX || '10', 10),
  message: { message: 'Bạn đã gửi quá nhiều câu hỏi. Vui lòng đợi 1 phút.' },
  keyGenerator: (req) => req.user?.id?.toString() || req.ip, // per-user limit
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API limiter
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  message: { message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, aiLimiter, generalLimiter };
