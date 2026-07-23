const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { upload }       = require('../middleware/uploadMiddleware');
const participCtrl     = require('../controllers/participationController');

router.get('/',     authenticate, participCtrl.getMyParticipations);
router.post('/',    authenticate, upload.array('files', 5), participCtrl.createParticipation);
router.get('/:id',  authenticate, participCtrl.getParticipationById);

module.exports = router;
