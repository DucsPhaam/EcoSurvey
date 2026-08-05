/**
 * @module HomepageRoutes
 * @description Định nghĩa các tuyến đường cung cấp dữ liệu công khai cho trang chủ Landing Page (Thống kê chung, Khảo sát nổi bật, Bảng vinh danh gần nhất).
 * 
 * @routes
 * - `GET /stats`: Lấy chỉ số thống kê trang chủ.
 * - `GET /top-surveys`: Lấy 3 khảo sát phát động mới nhất.
 * - `GET /recent-respondents`: Lấy 6 lượt nộp bài gần nhất.
 * 
 * @relations
 * - Server: Gắn tại `/api/homepage` trong `server.js`.
 * - Controller: `homepageController.js`.
 * - Frontend: `homepageService.js` (`frontend/src/services/homepageService.js`).
 */
const router = require('express').Router();
const homepageCtrl = require('../controllers/homepageController');

router.get('/stats', homepageCtrl.getStats);
router.get('/top-surveys', homepageCtrl.getTopSurveys);
router.get('/recent-respondents', homepageCtrl.getRecentRespondents);

module.exports = router;
