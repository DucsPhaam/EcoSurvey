const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const notifCtrl = require('../controllers/notificationController');

router.get('/',                authenticate, notifCtrl.getNotifications);
router.patch('/read-all',      authenticate, notifCtrl.markAllAsRead);
router.patch('/:id/read',      authenticate, notifCtrl.markAsRead);

module.exports = router;
