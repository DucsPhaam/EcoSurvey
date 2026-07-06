const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const surveyCtrl = require('../controllers/surveyController');

router.get('/',          authenticate, surveyCtrl.getSurveys);
router.get('/:id',       authenticate, surveyCtrl.getSurveyDetail);
router.post('/:id/submit', authenticate, surveyCtrl.submitSurvey);

module.exports = router;
