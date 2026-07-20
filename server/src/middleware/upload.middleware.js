const multer = require('multer');
const { AppError } = require('./errorHandler');

// Use memory storage — buffer is streamed directly to Cloudinary
const storage = multer.memoryStorage();

// Allow only common image MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(null, true);
  }
  cb(new AppError('Only JPEG, PNG, WebP, and GIF images are allowed.', 400), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5 MB
    files: 1,                    // one file per request
  },
});

/**
 * uploadSingle — multer middleware for a single "image" field.
 * Wraps multer's callback-based error into Express next().
 */
const uploadSingle = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return next(err); // Multer errors are handled in errorHandler
    }
    next();
  });
};

module.exports = { uploadSingle };
