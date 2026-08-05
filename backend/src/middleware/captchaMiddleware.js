/**
 * @module CaptchaMiddleware
 * @description Middleware xác minh mã xác nhận chống bot tự động (Cloudflare Turnstile CAPTCHA).
 * 
 * @function verifyCaptcha
 * @description Trích xuất token `cf-turnstile-response` từ body request và gửi yêu cầu xác thực sang server Cloudflare.
 * @param {Object} req - Request object từ Express.
 * @param {Object} res - Response object từ Express.
 * @param {Function} next - Callback chuyển tiếp xử lý.
 * @returns {Promise<void>}
 * 
 * @implementation
 * - Bước 1: Kiểm tra xem biến `TURNSTILE_SECRET_KEY` có được thiết lập hoặc môi trường có phải 'test' không. Nếu đúng, bỏ qua kiểm tra CAPTCHA.
 * - Bước 2: Lấy chuỗi `cf-turnstile-response` từ `req.body`. Trả về lỗi 400 nếu thiếu token.
 * - Bước 3: Gửi yêu cầu HTTP POST sang API Cloudflare Turnstile (`https://challenges.cloudflare.com/turnstile/v0/siteverify`).
 * - Bước 4: Kiểm tra cờ `data.success`. Nếu xác thực thất bại, ghi log cảnh báo và trả về lỗi 400.
 * - Bước 5: Nếu hợp lệ, gọi `next()` cho phép tiếp tục xử lý đăng ký/đăng nhập.
 * 
 * @relations
 * - Router sử dụng: `authRoutes.js` (áp dụng cho các tuyến đường Đăng ký, Đăng nhập, Quên mật khẩu).
 * - Phía Frontend: Tương ứng với các Form đăng ký/đăng nhập có nhúng Widget Cloudflare Turnstile.
 */
const logger = require('../utils/logger');

exports.verifyCaptcha = async (req, res, next) => {
  if (!process.env.TURNSTILE_SECRET_KEY || process.env.NODE_ENV === 'test') {
    logger.warn('CAPTCHA verification bypassed (either missing key or test env).');
    return next();
  }

  const token = req.body['cf-turnstile-response'];
  if (!token) {
    return res.status(400).json({ message: 'CAPTCHA token is missing. Please complete the CAPTCHA.' });
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: req.ip,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      logger.warn(`CAPTCHA verification failed: ${JSON.stringify(data['error-codes'])}`);
      return res.status(400).json({ message: 'CAPTCHA verification failed. Please try again.' });
    }

    next();
  } catch (error) {
    logger.error('Error verifying CAPTCHA:', error);
    res.status(500).json({ message: 'Internal server error during CAPTCHA verification.' });
  }
};
