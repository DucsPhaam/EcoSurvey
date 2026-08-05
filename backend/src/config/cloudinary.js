/**
 * @module CloudinaryConfig
 * @description Cấu hình tích hợp dịch vụ Cloudinary để lưu trữ và quản lý media (hình ảnh, tài liệu minh chứng).
 * 
 * @implementation
 * - Bước 1: Nạp SDK `cloudinary` v2.
 * - Bước 2: Gọi `cloudinary.config` truyền các biến môi trường (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).
 * - Bước 3: Bật tham số `secure: true` để luôn sử dụng HTTPS khi giao tiếp và tải ảnh.
 * - Bước 4: Export đối tượng `cloudinary` đã cấu hình để các middleware và controller sử dụng.
 * 
 * @relations
 * - Middleware sử dụng: `backend/src/middleware/uploadMiddleware.js` (dùng CloudinaryStorage để tải file trực tiếp lên Cloudinary).
 * - Service/Controller sử dụng: `backend/src/services/storageService.js`, `backend/src/controllers/fileController.js` (xóa hoặc thao tác với file trên Cloudinary).
 */
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

module.exports = cloudinary;
