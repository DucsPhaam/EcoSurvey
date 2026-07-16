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

// ── Users ─────────────────────────────────────────────────────
router.get('/users', ...isAdmin, adminCtrl.getUsers);
router.post('/users/import', ...isAdmin, upload.single('file'), adminCtrl.importUsers);
router.patch('/users/:id/status', ...isAdmin, adminCtrl.updateUserStatus);
router.delete('/users/:id', ...isAdmin, adminCtrl.deleteUser);
router.get('/stats', ...isAdmin, adminCtrl.getStats);

// ── Surveys ───────────────────────────────────────────────────
router.get('/surveys', ...isAdmin, surveyCtrl.adminGetSurveys);
router.post('/surveys', ...isAdmin, surveyCtrl.adminCreateSurvey);
router.get('/surveys/:id', ...isAdmin, surveyCtrl.adminGetSurveyById);
router.patch('/surveys/:id', ...isAdmin, surveyCtrl.adminUpdateSurvey);
router.delete('/surveys/:id', ...isAdmin, surveyCtrl.adminDeleteSurvey);
router.get('/surveys/:id/responses', ...isAdmin, surveyCtrl.getSurveyResponses);
router.put('/surveys/responses/:id/score', ...isAdmin, surveyCtrl.gradeOpinion);
router.get('/surveys/:id/analytics', ...isAdmin, surveyCtrl.adminGetAnalytics);

// ── Questions ─────────────────────────────────────────────────
router.get('/surveys/:surveyId/questions', ...isAdmin, surveyCtrl.getQuestions);
router.post('/surveys/:surveyId/questions', ...isAdmin, surveyCtrl.createQuestion);
router.patch('/surveys/:surveyId/questions/reorder', ...isAdmin, surveyCtrl.reorderQuestions);
// FIX #4: Dùng /surveys/:surveyId/questions/:id thay vì /questions/:id để verify ownership (IDOR protection)
router.patch('/surveys/:surveyId/questions/:id', ...isAdmin, surveyCtrl.updateQuestion);
router.delete('/surveys/:surveyId/questions/:id', ...isAdmin, surveyCtrl.deleteQuestion);

// ── Participations ────────────────────────────────────────────
router.get('/participations', ...isAdmin, participCtrl.adminGetParticipations);
router.get('/participations/:id', ...isAdmin, participCtrl.getParticipationById);
router.patch('/participations/:id/review', ...isAdmin, participCtrl.reviewParticipation);
router.post('/participations/:id/summarize', ...isAdmin, participCtrl.summarizeParticipation);

// ── FAQs ─────────────────────────────────────────────────────
router.get('/faqs', ...isAdmin, adminCtrl.getFAQs);
router.post('/faqs', ...isAdmin, adminCtrl.createFAQ);
router.patch('/faqs/:id', ...isAdmin, adminCtrl.updateFAQ);
router.delete('/faqs/:id', ...isAdmin, adminCtrl.deleteFAQ);

// ── Export ────────────────────────────────────────────────────
router.get('/export/surveys/:id/excel', ...isAdmin, exportCtrl.exportSurveyExcel);
router.get('/export/participations/pdf', ...isAdmin, exportCtrl.exportParticipationsPDF);

module.exports = router;
