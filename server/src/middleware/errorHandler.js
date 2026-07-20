const logger = require('../utils/logger');

/**
 * Central error handler middleware.
 * Every error flows through here – no server crash.
 */
const errorHandler = (err, req, res, _next) => {
  // Always log with full context
  logger.error(`[${req.method}] ${req.originalUrl} — ${err.message}`, {
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    code: err.code,
    name: err.name,
  });

  // ── Prisma errors ────────────────────────────────────────────────────────────
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Conflict',
      data: null,
      error: 'A record with this value already exists.',
    });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Not Found',
      data: null,
      error: 'Record not found.',
    });
  }
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Bad Request',
      data: null,
      error: 'Foreign key constraint failed.',
    });
  }

  // ── JWT errors ───────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      data: null,
      error: 'Invalid authentication token.',
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      data: null,
      error: 'Authentication token has expired.',
    });
  }

  // ── Multer / upload errors ────────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Payload Too Large',
      data: null,
      error: 'File too large. Maximum size is 5 MB.',
    });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Bad Request',
      data: null,
      error: 'Unexpected file field. Use the "image" field.',
    });
  }

  // ── CORS error ───────────────────────────────────────────────────────────────
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden',
      data: null,
      error: err.message,
    });
  }

  // ── Application errors (thrown by controllers) ────────────────────────────────
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.name === 'AppError' ? 'Request Error' : 'Internal Server Error',
    data: null,
    error: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal server error',
  });
};

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };
