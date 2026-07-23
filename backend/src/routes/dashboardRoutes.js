const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const dashCtrl = require('../controllers/dashboardController');

router.get('/', authenticate, dashCtrl.getDashboard);

module.exports = router;
