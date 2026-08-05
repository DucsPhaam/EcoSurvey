/**
 * @module AuthRoutes
 * @description Định nghĩa các tuyến đường xác thực hệ thống: Đăng ký, Đăng nhập, Làm mới Token, Quên mật khẩu, Xác minh Email và Google OAuth.
 * 
 * @routes
 * - `POST /register`: Đăng ký tài khoản (có CAPTCHA & RateLimit).
 * - `GET /check-username`: Kiểm tra Username trùng lặp.
 * - `GET /check-email`: Kiểm tra Email trùng lặp.
 * - `POST /login`: Đăng nhập (có CAPTCHA & RateLimit).
 * - `POST /refresh`: Gia hạn Access Token từ Cookie Refresh Token.
 * - `POST /logout`: Đăng xuất và xóa Refresh Token.
 * - `POST /forgot-password`: Gửi email đặt lại mật khẩu.
 * - `POST /reset-password`: Thiết lập mật khẩu mới.
 * - `POST /send-verification`: Gửi lại email xác minh địa chỉ email.
 * - `GET /verify-email`: Xác minh token email.
 * - `GET /google`: Đăng nhập qua Google OAuth.
 * - `GET /google/callback`: Callback sau khi Google xác thực thành công.
 * 
 * @relations
 * - Server: Gắn tại `/api/auth` trong `server.js`.
 * - Controller: `authController.js`.
 * - Frontend Services: `authService.js` (`frontend/src/services/authService.js`).
 */
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { loginLimiter } = require('../middleware/rateLimitMiddleware');
const { authenticate } = require('../middleware/authMiddleware');
const authCtrl = require('../controllers/authController');
const { verifyCaptcha } = require('../middleware/captchaMiddleware');

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 1 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: 'Quá nhiều tài khoản được tạo từ IP này. Vui lòng thử lại sau 1 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register',          registerLimiter, verifyCaptcha, authCtrl.register);
router.get('/check-username',     authCtrl.checkUsername);
router.get('/check-email',        authCtrl.checkEmail);
router.post('/login',             loginLimiter, verifyCaptcha, authCtrl.login);
router.post('/refresh',           authCtrl.refresh);
router.post('/logout',            authCtrl.logout);

router.post('/forgot-password',   forgotPasswordLimiter, authCtrl.forgotPassword);
router.post('/reset-password',    authCtrl.resetPassword);

router.post('/send-verification', authenticate, authCtrl.sendVerificationEmail);
router.get('/verify-email',       authCtrl.verifyEmail);

const passport = require('passport');
const frontendUrl = (process.env.CLIENT_URL || 'http://localhost:8080').replace(/\/$/, '');
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${frontendUrl}/login?error=auth_failed` }), authCtrl.googleCallback);

module.exports = router;
