/**
 * @module NotificationRoutes
 * @description Định nghĩa các tuyến đường quản lý thông báo người dùng.
 * 
 * @routes
 * - `GET /`: Lấy danh sách thông báo cá nhân phân trang.
 * - `PATCH /read-all`: Đánh dấu toàn bộ thông báo là đã đọc.
 * - `PATCH /:id/read`: Đánh dấu 1 thông báo cụ thể là đã đọc.
 * 
 * @relations
 * - Server: Gắn tại `/api/notifications` trong `server.js`.
 * - Controller: `notificationController.js`.
 * - Frontend: `notificationService.js` gọi từ `Navbar.jsx`.
 */
const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const notifCtrl = require('../controllers/notificationController');

router.get('/',                authenticate, notifCtrl.getNotifications);
router.patch('/read-all',      authenticate, notifCtrl.markAllAsRead);
router.patch('/:id/read',      authenticate, notifCtrl.markAsRead);

module.exports = router;
