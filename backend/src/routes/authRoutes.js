const router = require('express').Router();
const { loginLimiter } = require('../middleware/rateLimitMiddleware');
const authCtrl = require('../controllers/authController');

router.post('/register',       authCtrl.register);
router.get('/check-username',  authCtrl.checkUsername);
router.get('/check-email',     authCtrl.checkEmail);
router.post('/login',          loginLimiter, authCtrl.login);
router.post('/refresh',        authCtrl.refresh);
router.post('/logout',         authCtrl.logout);

module.exports = router;
