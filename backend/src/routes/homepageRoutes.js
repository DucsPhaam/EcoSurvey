const router = require('express').Router();
const homepageCtrl = require('../controllers/homepageController');

router.get('/stats', homepageCtrl.getStats);
router.get('/top-surveys', homepageCtrl.getTopSurveys);
router.get('/recent-respondents', homepageCtrl.getRecentRespondents);

module.exports = router;
