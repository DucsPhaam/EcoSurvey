/**
 * @module DashboardRoutes
 * @description Định nghĩa tuyến đường tổng hợp thống kê cho trang Dashboard cá nhân.
 * 
 * @routes
 * - `GET /`: Lấy thông tin tổng quan Dashboard cá nhân/Admin (yêu cầu xác thực `authenticate`).
 * 
 * @relations
 * - Server: Gắn tại `/api/dashboard` trong `server.js`.
 * - Controller: `dashboardController.js`.
 * - Frontend: `dashboardService.getDashboard` gọi từ `MyDashboard.jsx` và `AdminDashboard.jsx`.
 */
const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const dashCtrl = require('../controllers/dashboardController');

router.get('/', authenticate, dashCtrl.getDashboard);

module.exports = router;
