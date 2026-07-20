const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS URLs
});

/**
 * Upload an image buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer memory storage.
 * @param {string} folder - Subfolder inside 'ai-farmer/' (e.g. 'products', 'avatars').
 * @returns {Promise<CloudinaryUploadResult>}
 */
const uploadImage = (buffer, folder = 'general') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `ai-farmer/${folder}`,
        resource_type: 'image',
        quality: 'auto:good',          // Smart compression
        fetch_format: 'auto',           // Serve WebP to modern browsers
        flags: 'progressive',           // Progressive JPEG
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      },
      (err, result) => {
        if (err) {
          logger.error(`Cloudinary upload error [${folder}]:`, err);
          return reject(err);
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary by public_id.
 * @param {string} publicId
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Cloudinary delete [${publicId}]: ${result.result}`);
    return result;
  } catch (err) {
    logger.error(`Cloudinary delete error [${publicId}]:`, err);
    throw err;
  }
};

/**
 * Extract public_id from a Cloudinary URL.
 * @param {string} url
 * @returns {string|null}
 */
const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    // Skip version segment (v123456789)
    const pathParts = parts.slice(uploadIndex + 1).filter(p => !/^v\d+$/.test(p));
    const fileWithExt = pathParts.join('/');
    return fileWithExt.replace(/\.[^.]+$/, ''); // Remove extension
  } catch {
    return null;
  }
};

module.exports = { uploadImage, deleteImage, extractPublicId };
