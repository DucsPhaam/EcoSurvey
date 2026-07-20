const multer = require('multer');
const path = require('path');
const fs = require('fs');

const MAX_SIZE  = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10) * 1024 * 1024; // bytes
const MAX_FILES = parseInt(process.env.MAX_FILES_PER_REPORT || '5', 10);

// FIX #15: Cross-reference extension ↔ MIME type
// Cách cũ chỉ check file.mimetype (do client gửi lên, có thể bị giả mạo).
// Cách mới: đảm bảo cả extension lẫn MIME type khớp nhau theo bảng whitelist.
// Lưu ý production: dùng thêm thư viện `file-type` để kiểm tra magic bytes thực sự.
const EXTENSION_MIME_MAP = {
  '.jpg':  ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png':  ['image/png'],
  '.gif':  ['image/gif'],
  '.webp': ['image/webp'],
  '.pdf':  ['application/pdf'],
};

const storage = multer.memoryStorage();
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = EXTENSION_MIME_MAP[ext];

  // Kiểm tra 1: Extension không nằm trong whitelist
  if (!allowedMimes) {
    return cb(new Error(`Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, WebP, PDF`));
  }

  // Kiểm tra 2: MIME type do client gửi không khớp với extension
  // Ngăn chặn trường hợp đổi tên file .php thành .jpg để bypass
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error(`MIME type không khớp với extension "${ext}". Vui lòng kiểm tra lại file.`));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: MAX_FILES },
});

module.exports = { upload };
