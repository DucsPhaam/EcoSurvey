const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { surveySubmitLimiter } = require('../middleware/rateLimitMiddleware');
const surveyCtrl = require('../controllers/surveyController');

const { verifyCaptcha } = require('../middleware/captchaMiddleware');

router.get('/',            authenticate, surveyCtrl.getSurveys);
router.get('/:id',         authenticate, surveyCtrl.getSurveyDetail);
// Anti-spam: 5 submits/minute per user + CAPTCHA
router.post('/:id/submit', authenticate, surveySubmitLimiter, verifyCaptcha, surveyCtrl.submitSurvey);

module.exports = router;

