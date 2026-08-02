/**
 * @module LeaderboardRoutes
 * @description Định nghĩa tuyến đường lấy dữ liệu Bảng xếp hạng điểm rèn luyện.
 * 
 * @routes
 * - `GET /`: Truy vấn Top 10 và thứ hạng cá nhân theo khoảng thời gian (`?period=week|month|all`).
 * 
 * @relations
 * - Server: Gắn tại `/api/leaderboard` trong `server.js`.
 * - Controller: `leaderboardController.js`.
 * - Frontend: `leaderboardService.js` gọi từ `Leaderboard.jsx`.
 */
const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const lbCtrl = require('../controllers/leaderboardController');

router.get('/', authenticate, lbCtrl.getLeaderboard);

module.exports = router;
