const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const fileCtrl = require('../controllers/fileController');

// FIX #16: Route phục vụ file upload với xác thực
// Thay thế express.static('/uploads') vốn không có access control
router.get('/:filename', authenticate, fileCtrl.serveFile);

module.exports = router;
