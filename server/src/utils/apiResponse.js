/**
 * Standard API response helpers
 */
const sendSuccess = (res, data, statusCode = 200, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, error, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: typeof error === 'string' ? error : error.message || 'Internal server error',
  });
};

const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    error: 'Validation failed',
    errors,
  });
};

module.exports = { sendSuccess, sendError, sendValidationError };
