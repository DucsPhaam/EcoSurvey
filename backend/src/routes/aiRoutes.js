const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { aiLimiter }    = require('../middleware/rateLimitMiddleware');
const aiCtrl           = require('../controllers/aiController');

router.post('/faqs', authenticate, aiLimiter, aiCtrl.askFAQ);

module.exports = router;
