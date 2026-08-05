/**
 * @module ParticipationRoutes
 * @description Định nghĩa các tuyến đường gửi bài báo cáo và xem chi tiết minh chứng ngoại khóa dành cho sinh viên.
 * 
 * @routes
 * - `GET /`: Lấy danh sách các bài báo cáo minh chứng của sinh viên hiện tại.
 * - `POST /`: Nộp báo cáo minh chứng mới kèm tối đa 5 tệp đính kèm (`upload.array('files', 5)`).
 * - `GET /:id`: Xem chi tiết 1 báo cáo minh chứng.
 * 
 * @relations
 * - Server: Gắn tại `/api/participations` trong `server.js`.
 * - Controller: `participationController.js`.
 * - Frontend: `participationService.js` gọi từ `MyParticipations.jsx` và `SubmitParticipation.jsx`.
 */
const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { upload }       = require('../middleware/uploadMiddleware');
const participCtrl     = require('../controllers/participationController');

router.get('/',     authenticate, participCtrl.getMyParticipations);
router.post('/',    authenticate, upload.array('files', 5), participCtrl.createParticipation);
router.get('/:id',  authenticate, participCtrl.getParticipationById);

module.exports = router;
