// Defines auth API routes: Register, Login, Refresh Token, Forgot Password, Email Verification, Google OAuth.
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { loginLimiter } = require('../middleware/rateLimitMiddleware');
const { authenticate } = require('../middleware/authMiddleware');
const authCtrl = require('../controllers/authController');
const { verifyCaptcha } = require('../middleware/captchaMiddleware');
const { primaryClientUrl } = require('../config/clientOrigins');

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
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${primaryClientUrl}/login?error=auth_failed` }), authCtrl.googleCallback);

module.exports = router;
