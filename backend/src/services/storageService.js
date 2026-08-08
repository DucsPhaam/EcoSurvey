// Storage service: Uploads file buffers directly to Cloudinary via streams and handles media deletion.
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
