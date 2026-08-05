/**
 * @module UploadMiddleware
 * @description Middleware xử lý tải tệp đính kèm (Hình ảnh minh chứng, tài liệu PDF, Avatar) sử dụng Multer, tích hợp bộ lọc mở rộng file và kiểm tra MIME type.
 * 
 * @constant EXTENSION_MIME_MAP
 * @description Bảng tra cứu danh sách định dạng đuôi file hợp lệ (.jpg, .jpeg, .png, .gif, .webp, .pdf) và MIME type tương ứng.
 * 
 * @function fileFilter
 * @description Hàm kiểm tra tính hợp lệ của tệp tải lên (ngăn chặn việc đổi tên file nguy hiểm như script .php thành .jpg).
 * @param {Object} _req - Request object.
 * @param {Object} file - Đối tượng thông tin tệp tải lên từ Multer.
 * @param {Function} cb - Callback kết quả kiểm tra Multer.
 * 
 * @implementation
 * - Bước 1: Trích xuất đuôi tệp `ext` từ `file.originalname`.
 * - Bước 2: Tra cứu đuôi tệp trong `EXTENSION_MIME_MAP`. Nếu không nằm trong danh sách, trả về lỗi từ chối.
 * - Bước 3: Đảm bảo MIME type thực sự khớp với danh sách MIME type cho phép của đuôi tệp đó.
 * - Bước 4: Lưu dữ liệu dưới dạng Memory Storage (`multer.memoryStorage()`) để dịch vụ `storageService` tiếp tục xử lý đẩy lên Cloudinary hoặc đĩa cục bộ.
 * 
 * @relations
 * - Router sử dụng: `participationRoutes.js` (`upload.array('files')`), `userRoutes.js` (`upload.single('avatar')`).
 * - Service tiêu thụ dữ liệu: `storageService.js` (`backend/src/services/storageService.js`).
 */
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
