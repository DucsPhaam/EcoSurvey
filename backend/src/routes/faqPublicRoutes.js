/**
 * @module FAQPublicRoutes
 * @description Định nghĩa các tuyến đường truy vấn danh sách câu hỏi FAQ công khai (không cần xác thực).
 * 
 * @routes
 * - `GET /public`: Lấy tất cả các câu hỏi FAQ đang kích hoạt.
 * 
 * @relations
 * - Server: Gắn tại `/api/faqs` trong `server.js`.
 * - Controller: `faqController.js`.
 * - Frontend: `faqService.getPublicFAQs` gọi từ `LandingPage.jsx`.
 */
const router = require('express').Router();
const faqCtrl = require('../controllers/faqController');

router.get('/public', faqCtrl.getPublicFAQs);

module.exports = router;
