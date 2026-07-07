const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const userCtrl = require('../controllers/userController');

router.get('/me',              authenticate, userCtrl.getMe);
router.patch('/me/theme',      authenticate, userCtrl.updateTheme);
router.patch('/me/password',   authenticate, userCtrl.changePassword);

module.exports = router;
