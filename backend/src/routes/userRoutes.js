/**
 * @module UserRoutes
 * @description Định nghĩa các tuyến đường quản lý thông tin hồ sơ người dùng cá nhân (Profile, Mật khẩu, Avatar, Giao diện, Điểm thưởng, Huy hiệu).
 * 
 * @routes
 * - `GET /me`: Lấy thông tin tài khoản hiện tại.
 * - `PATCH /me/profile`: Cập nhật thông tin cá nhân.
 * - `GET /me/points`: Lấy lịch sử cộng điểm rèn luyện.
 * - `GET /me/badges`: Lấy danh sách huy hiệu thưởng.
 * - `PATCH /me/theme`: Thay đổi giao diện Light/Dark mode.
 * - `PATCH /me/password`: Đổi mật khẩu.
 * - `POST /me/avatar`: Tải ảnh đại diện Avatar mới (`upload.single('avatar')`).
 * 
 * @relations
 * - Server: Gắn tại `/api/users` trong `server.js`.
 * - Controller: `userController.js`.
 * - Frontend: `userService.js` (`frontend/src/services/userService.js`).
 */
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
