const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { aiLimiter }    = require('../middleware/rateLimitMiddleware');
const aiCtrl           = require('../controllers/aiController');

router.post('/faqs',        authenticate, aiLimiter, aiCtrl.askFAQ);
router.post('/faqs/public', aiLimiter,              aiCtrl.askFAQ); // Public — landing page chatbot

module.exports = router;
