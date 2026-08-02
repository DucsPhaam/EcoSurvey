/**
 * @module FileController
 * @description Controller phục vụ truyền phát (serve) tệp tin tải lên có xác thực bảo mật, chống truy cập trái phép và chống tấn công Path Traversal.
 * 
 * @function serveFile
 * @description Truyền phát nội dung tệp đính kèm cục bộ cho các yêu cầu đã qua xác thực `authMiddleware`.
 * @param {Object} req - Request chứa `req.params.filename`.
 * @param {Object} res - Response chứa luồng tệp tin `res.sendFile`.
 * 
 * @implementation
 * - Bước 1: Sử dụng `path.basename` làm sạch tên tệp ngăn chặn ký tự di chuyển đường dẫn `../`.
 * - Bước 2: Kiểm tra đường dẫn tệp tuyệt đối bằng `filePath.startsWith(uploadDir)`.
 * - Bước 3: Kiểm tra sự tồn tại của tệp trên đĩa cứng bằng `fs.existsSync`.
 * - Bước 4: Trả tệp tin về client thông qua `res.sendFile`.
 * 
 * @relations
 * - Route: `GET /api/files/:filename` trong `fileRoutes.js`.
 * - Guard: `authenticate`.
 * - Frontend: Được gọi khi người dùng mở xem hình ảnh/tài liệu minh chứng đã upload.
 */
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
