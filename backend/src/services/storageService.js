/**
 * @module StorageService
 * @description Dịch vụ xử lý tải tệp dữ liệu dạng Buffer trực tiếp lên Cloudinary thông qua Stream và quản lý việc xóa tệp media.
 * 
 * @function uploadBuffer
 * @description Đẩy tệp dạng Buffer lên đám mây Cloudinary theo thư mục tùy chỉnh.
 * @param {Buffer} buffer - Bộ nhớ đệm tệp (từ Multer memoryStorage).
 * @param {string} folder - Tên thư mục lưu trữ trên Cloudinary (Mặc định 'ecosurvey').
 * @returns {Promise<Object>} Phản hồi kết quả tải tệp từ Cloudinary (URL, public_id, v.v.).
 * 
 * @function deleteFile
 * @description Xóa tệp khỏi Cloudinary dựa trên `public_id`.
 * @param {string} public_id - Mã định danh tệp trên Cloudinary.
 * @returns {Promise<Object>} Kết quả xóa tệp.
 * 
 * @implementation
 * - Sử dụng `cloudinary.uploader.upload_stream` với cấu hình `resource_type: 'auto'` để tự động phát hiện ảnh hay tài liệu PDF.
 * - Đẩy dữ liệu buffer qua `uploadStream.end(buffer)`.
 * 
 * @relations
 * - Config: `cloudinary.js` (`backend/src/config/cloudinary.js`).
 * - Controllers liên quan: `fileController.js`, `participationController.js`, `userController.js` (tải avatar).
 * - Middleware sử dụng: `uploadMiddleware.js`.
 */
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

exports.uploadBuffer = (buffer, folder = 'ecosurvey') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

exports.deleteFile = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (err) {
    logger.error('Cloudinary delete error:', err);
    throw err;
  }
};
