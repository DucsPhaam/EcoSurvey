const router = require('express').Router();
const faqCtrl = require('../controllers/faqController');

// Public — no auth required
router.get('/public', faqCtrl.getPublicFAQs);

module.exports = router;
