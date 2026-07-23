const path = require('path');
const fs   = require('fs');
const logger = require('../utils/logger');

/**
 * FIX #16: Phục vụ file upload qua route có xác thực
 * GET /api/files/:filename
 *
 * Lý do: express.static('/uploads') phục vụ file cho BẤT KỲ ai biết URL
 * (kể cả người chưa đăng nhập). Controller này đảm bảo chỉ user đã
 * authenticate mới tải được file — authMiddleware đã verify trước khi vào đây.
 */
exports.serveFile = (req, res) => {
  try {
    // Ngăn chặn path traversal (ví dụ: ../../etc/passwd)
    const filename = path.basename(req.params.filename);
    const uploadDir = path.resolve(
      __dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads'
    );
    const filePath = path.join(uploadDir, filename);

    // Chỉ serve file nằm trong uploadDir (double-check sau basename)
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
