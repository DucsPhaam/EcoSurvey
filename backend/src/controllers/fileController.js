// File controller: Serves uploaded files securely with authorization checks.
const path = require('path');
const fs   = require('fs');
const logger = require('../utils/logger');

exports.serveFile = (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const uploadDir = path.resolve(
      __dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads'
    );
    const filePath = path.join(uploadDir, filename);

    if (!filePath.startsWith(uploadDir)) {
      return res.status(400).json({ message: 'Invalid file path.' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found.' });
    }

    res.sendFile(filePath);
  } catch (err) {
    logger.error('serveFile error:', err);
    res.status(500).json({ message: 'Failed to serve file.' });
  }
};
