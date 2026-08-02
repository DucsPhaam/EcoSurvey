/**
 * @module SurveyRoutes
 * @description Định nghĩa các tuyến đường xem bài khảo sát và nộp câu trả lời dành cho người dùng.
 * 
 * @routes
 * - `GET /`: Lấy danh sách bài khảo sát khả dụng với người dùng hiện tại.
 * - `GET /:id`: Lấy thông tin chi tiết đợt khảo sát và câu hỏi.
 * - `POST /:id/submit`: Nộp bài làm khảo sát (Bảo vệ bởi `surveySubmitLimiter` và `verifyCaptcha`).
 * 
 * @relations
 * - Server: Gắn tại `/api/surveys` trong `server.js`.
 * - Controller: `surveyController.js`.
 * - Frontend: `surveyService.js` gọi từ `SurveyBoard.jsx` và `SurveyDetail.jsx`.
 */
const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { surveySubmitLimiter } = require('../middleware/rateLimitMiddleware');
const surveyCtrl = require('../controllers/surveyController');
const { verifyCaptcha } = require('../middleware/captchaMiddleware');

router.get('/',            authenticate, surveyCtrl.getSurveys);
router.get('/:id',         authenticate, surveyCtrl.getSurveyDetail);
router.post('/:id/submit', authenticate, surveySubmitLimiter, verifyCaptcha, surveyCtrl.submitSurvey);

module.exports = router;
