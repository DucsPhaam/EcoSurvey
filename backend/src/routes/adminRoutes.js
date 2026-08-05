/**
 * @module AdminRoutes
 * @description Định nghĩa tất cả các tuyến đường (Endpoints) quản trị hệ thống EcoSurvey dành cho Quản trị viên (Admin).
 * 
 * @security
 * - Tất cả các route trong tệp này đều yêu cầu Middleware xác thực JWT (`authenticate`) và phân quyền vai trò (`authorize('Admin')`).
 * 
 * @routes
 * - **Users**: `GET /users`, `POST /users/import`, `PATCH /users/:id/status`, `DELETE /users/:id`, `GET /stats`.
 * - **Surveys**: `GET /surveys`, `POST /surveys`, `GET /surveys/:id`, `PATCH /surveys/:id`, `DELETE /surveys/:id`, `GET /surveys/:id/responses`, `PUT /surveys/responses/:id/score`, `GET /surveys/:id/analytics`.
 * - **Questions**: `GET /surveys/:surveyId/questions`, `POST /surveys/:surveyId/questions`, `PATCH /surveys/:surveyId/questions/reorder`, `PATCH /surveys/:surveyId/questions/:id`, `DELETE /surveys/:surveyId/questions/:id`.
 * - **Participations**: `GET /participations`, `GET /participations/:id`, `PATCH /participations/:id/review`, `POST /participations/:id/summarize`.
 * - **FAQs**: `GET /faqs`, `POST /faqs`, `PATCH /faqs/:id`, `DELETE /faqs/:id`.
 * - **Export**: `GET /export/surveys/:id/excel`, `GET /export/participations/pdf`.
 * 
 * @relations
 * - Server: Gắn tại `/api/admin` trong `backend/src/server.js`.
 * - Frontend: Gọi bởi `adminService.js` từ các trang quản trị (`AdminDashboard.jsx`, `UserManagement.jsx`, `SurveyManagement.jsx`, `SurveyEditor.jsx`, `SurveyAnalytics.jsx`, `ParticipationReview.jsx`, `FAQManagement.jsx`).
 */
const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const adminCtrl = require('../controllers/adminController');
const surveyCtrl = require('../controllers/surveyController');
const participCtrl = require('../controllers/participationController');
const exportCtrl = require('../controllers/exportController');
const multer = require('multer');

const isAdmin = [authenticate, authorize('Admin')];
const upload = multer({ storage: multer.memoryStorage() });

// ── Người dùng (Users Management) ──────────────────────────────
router.get('/users', ...isAdmin, adminCtrl.getUsers);
router.post('/users/import', ...isAdmin, upload.single('file'), adminCtrl.importUsers);
router.patch('/users/:id/status', ...isAdmin, adminCtrl.updateUserStatus);
router.delete('/users/:id', ...isAdmin, adminCtrl.deleteUser);
router.get('/stats', ...isAdmin, adminCtrl.getStats);

// ── Khảo sát (Surveys Management) ──────────────────────────────
router.get('/surveys', ...isAdmin, surveyCtrl.adminGetSurveys);
router.post('/surveys', ...isAdmin, surveyCtrl.adminCreateSurvey);
router.get('/surveys/:id', ...isAdmin, surveyCtrl.adminGetSurveyById);
router.patch('/surveys/:id', ...isAdmin, surveyCtrl.adminUpdateSurvey);
router.delete('/surveys/:id', ...isAdmin, surveyCtrl.adminDeleteSurvey);
router.get('/surveys/:id/responses', ...isAdmin, surveyCtrl.getSurveyResponses);
router.put('/surveys/responses/:id/score', ...isAdmin, surveyCtrl.gradeOpinion);
router.get('/surveys/:id/analytics', ...isAdmin, surveyCtrl.adminGetAnalytics);

// ── Câu hỏi (Questions Management) ─────────────────────────────
router.get('/surveys/:surveyId/questions', ...isAdmin, surveyCtrl.getQuestions);
router.post('/surveys/:surveyId/questions', ...isAdmin, surveyCtrl.createQuestion);
router.patch('/surveys/:surveyId/questions/reorder', ...isAdmin, surveyCtrl.reorderQuestions);
router.patch('/surveys/:surveyId/questions/:id', ...isAdmin, surveyCtrl.updateQuestion);
router.delete('/surveys/:surveyId/questions/:id', ...isAdmin, surveyCtrl.deleteQuestion);

// ── Minh chứng (Participations Management) ─────────────────────
router.get('/participations', ...isAdmin, participCtrl.adminGetParticipations);
router.get('/participations/:id', ...isAdmin, participCtrl.getParticipationById);
router.patch('/participations/:id/review', ...isAdmin, participCtrl.reviewParticipation);
router.post('/participations/:id/summarize', ...isAdmin, participCtrl.summarizeParticipation);

// ── Câu hỏi thường gặp (FAQs Management) ───────────────────────
router.get('/faqs', ...isAdmin, adminCtrl.getFAQs);
router.post('/faqs', ...isAdmin, adminCtrl.createFAQ);
router.patch('/faqs/:id', ...isAdmin, adminCtrl.updateFAQ);
router.delete('/faqs/:id', ...isAdmin, adminCtrl.deleteFAQ);

// ── Xuất báo cáo (Export Reports) ─────────────────────────────
router.get('/export/surveys/:id/excel', ...isAdmin, exportCtrl.exportSurveyExcel);
router.get('/export/participations/pdf', ...isAdmin, exportCtrl.exportParticipationsPDF);

module.exports = router;
