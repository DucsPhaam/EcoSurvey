/**
 * @module FileRoutes
 * @description Định nghĩa tuyến đường phục vụ tệp đính kèm cục bộ có xác thực tài khoản người dùng (`authenticate`).
 * 
 * @routes
 * - `GET /:filename`: Truyền phát nội dung tệp tin đã upload sau khi xác thực token.
 * 
 * @relations
 * - Server: Gắn tại `/api/files` trong `server.js`.
 * - Controller: `fileController.js`.
 */
const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const fileCtrl = require('../controllers/fileController');

router.get('/:filename', authenticate, fileCtrl.serveFile);

module.exports = router;
