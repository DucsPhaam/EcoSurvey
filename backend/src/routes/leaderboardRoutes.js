const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const lbCtrl = require('../controllers/leaderboardController');

router.get('/', authenticate, lbCtrl.getLeaderboard);

module.exports = router;
