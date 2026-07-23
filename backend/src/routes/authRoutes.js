const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { loginLimiter } = require('../middleware/rateLimitMiddleware');
const { authenticate } = require('../middleware/authMiddleware');
const authCtrl = require('../controllers/authController');

// Strict limiter for sensitive auth endpoints
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 1 giờ.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { message: 'Quá nhiều tài khoản được tạo từ IP này. Vui lòng thử lại sau.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const { verifyCaptcha } = require('../middleware/captchaMiddleware');

router.post('/register',          registerLimiter, verifyCaptcha, authCtrl.register);
router.get('/check-username',     authCtrl.checkUsername);
router.get('/check-email',        authCtrl.checkEmail);
router.post('/login',             loginLimiter, verifyCaptcha, authCtrl.login);
router.post('/refresh',           authCtrl.refresh);
router.post('/logout',            authCtrl.logout);

// Password reset flow (no auth required)
router.post('/forgot-password',   forgotPasswordLimiter, authCtrl.forgotPassword);
router.post('/reset-password',    authCtrl.resetPassword);

// Email verification (requires auth for send, no auth for verify link)
router.post('/send-verification', authenticate, authCtrl.sendVerificationEmail);
router.get('/verify-email',       authCtrl.verifyEmail);

// Google OAuth
const passport = require('passport');
const frontendUrl = (process.env.CLIENT_URL || 'http://localhost:8080').replace(/\/$/, '');
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${frontendUrl}/login?error=auth_failed` }), authCtrl.googleCallback);

module.exports = router;

