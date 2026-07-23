const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize }    = require('../middleware/roleMiddleware');
const exportCtrl       = require('../controllers/exportController');

const isAdmin = [authenticate, authorize('Admin')];

router.get('/surveys/:id/excel',    ...isAdmin, exportCtrl.exportSurveyExcel);
router.get('/participations/pdf',   ...isAdmin, exportCtrl.exportParticipationsPDF);

module.exports = router;
