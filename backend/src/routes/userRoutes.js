// Defines API routes for user profile management (profile, password, avatar, theme, points, badges).
const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const userCtrl = require('../controllers/userController');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/me',              authenticate, userCtrl.getMe);
router.patch('/me/profile',    authenticate, userCtrl.updateProfile);
router.get('/me/points',       authenticate, userCtrl.getPointHistory);
router.get('/me/badges',       authenticate, userCtrl.getBadges);
router.patch('/me/theme',      authenticate, userCtrl.updateTheme);
router.patch('/me/password',   authenticate, userCtrl.changePassword);
router.post('/me/avatar',      authenticate, upload.single('avatar'), userCtrl.uploadAvatar);

module.exports = router;
