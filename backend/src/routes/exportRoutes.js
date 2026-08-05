/**
 * @module ExportRoutes
 * @description Định nghĩa các tuyến đường xuất báo cáo Excel/PDF dành cho Admin.
 * 
 * @routes
 * - `GET /surveys/:id/excel`: Xuất kết quả khảo sát ra file Excel `.xlsx`.
 * - `GET /participations/pdf`: Xuất báo cáo hoạt động đã duyệt ra file PDF.
 * 
 * @relations
 * - Server: Gắn tại `/api/export` trong `server.js`.
 * - Controller: `exportController.js`.
 * - Frontend: `exportService.js` (`frontend/src/services/exportService.js`).
 */
const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize }    = require('../middleware/roleMiddleware');
const exportCtrl       = require('../controllers/exportController');

const isAdmin = [authenticate, authorize('Admin')];

router.get('/surveys/:id/excel',    ...isAdmin, exportCtrl.exportSurveyExcel);
router.get('/participations/pdf',   ...isAdmin, exportCtrl.exportParticipationsPDF);

module.exports = router;
