const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

/**
 * Uploads a buffer directly to Cloudinary via stream.
 * @param {Buffer} buffer - The file buffer.
 * @param {string} folder - The destination folder in Cloudinary.
 * @returns {Promise<Object>} The Cloudinary upload result.
 */
exports.uploadBuffer = (buffer, folder = 'ecosurvey') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Automatically detect image vs pdf vs video
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

/**
 * Deletes a file from Cloudinary given its public_id.
 * @param {string} public_id - The Cloudinary public_id of the file.
 * @returns {Promise<Object>} The Cloudinary deletion result.
 */
exports.deleteFile = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (err) {
    logger.error('Cloudinary delete error:', err);
    throw err;
  }
};
