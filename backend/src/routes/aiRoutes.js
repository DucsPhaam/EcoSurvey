/**
 * @module AIRoutes
 * @description Định nghĩa các tuyến đường giao tiếp với Gemini AI Chatbot.
 * 
 * @routes
 * - `POST /faqs`: Hỏi đáp AI có xác thực tài khoản.
 * - `POST /faqs/public`: Hỏi đáp AI công khai cho khách ghé thăm Landing Page.
 * 
 * @relations
 * - Server: Gắn tại `/api/ai` trong `server.js`.
 * - Controller: `aiController.js`.
 * - Frontend: `FAQChatWidget.jsx`, `LandingChatWidget.jsx`.
 */
const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { aiLimiter }    = require('../middleware/rateLimitMiddleware');
const aiCtrl           = require('../controllers/aiController');

router.post('/faqs',        authenticate, aiLimiter, aiCtrl.askFAQ);
router.post('/faqs/public', aiLimiter,              aiCtrl.askFAQ);

module.exports = router;
