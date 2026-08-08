// Defines public API routes for FAQ queries.
const router = require('express').Router();
const faqCtrl = require('../controllers/faqController');

router.get('/public', faqCtrl.getPublicFAQs);

module.exports = router;
