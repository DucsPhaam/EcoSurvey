const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { generalLimiter } = require('../middleware/rateLimitMiddleware');
const surveyCtrl = require('../controllers/surveyController');

router.get('/',            authenticate, surveyCtrl.getSurveys);
router.get('/:id',         authenticate, surveyCtrl.getSurveyDetail);
// FIX #20: Thêm generalLimiter cho submit endpoint để chống flood request
router.post('/:id/submit', authenticate, generalLimiter, surveyCtrl.submitSurvey);

module.exports = router;
