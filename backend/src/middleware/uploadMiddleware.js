const multer = require('multer');
const path = require('path');
const fs = require('fs');

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10) * 1024 * 1024; // bytes
const MAX_FILES = parseInt(process.env.MAX_FILES_PER_REPORT || '5', 10);
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, WebP, PDF`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: MAX_FILES },
});

module.exports = { upload };
