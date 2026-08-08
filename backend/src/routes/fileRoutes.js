// Defines API route for serving local uploaded files securely.
const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const fileCtrl = require('../controllers/fileController');

router.get('/:filename', authenticate, fileCtrl.serveFile);

module.exports = router;
