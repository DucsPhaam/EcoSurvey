const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const userCtrl = require('../controllers/userController');

router.get('/me',              authenticate, userCtrl.getMe);
router.get('/me/points',       authenticate, userCtrl.getPointHistory);
router.get('/me/badges',       authenticate, userCtrl.getBadges);
router.patch('/me/theme',      authenticate, userCtrl.updateTheme);
router.patch('/me/password',   authenticate, userCtrl.changePassword);

const { upload } = require('../middleware/uploadMiddleware');
router.post('/me/avatar',      authenticate, upload.single('avatar'), userCtrl.uploadAvatar);

module.exports = router;
