// Upload middleware: Handles file attachments (proof images, PDFs, avatars) using Multer with file extension and MIME type filtering.
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const MAX_SIZE  = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10) * 1024 * 1024;
const MAX_FILES = parseInt(process.env.MAX_FILES_PER_REPORT || '5', 10);

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

  if (!allowedMimes) {
    return cb(new Error(`Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, WebP, PDF`));
  }

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
