const rateLimit = require('express-rate-limit');

/**
 * Returns a standard rate limit exceeded message.
 */
const rateLimitMessage = (msg) => ({
  success: false,
  message: 'Too Many Requests',
  data: null,
  error: msg,
});

/**
 * General API limiter — 300 req per 15 min per IP.
 * Active in ALL environments (removed `skip` that disabled it outside production).
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: rateLimitMessage('Too many requests. Please try again in 15 minutes.'),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth limiter — 20 attempts per 15 min.
 * Protects login/register from brute-force.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: rateLimitMessage('Too many authentication attempts. Please try again in 15 minutes.'),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI endpoint limiter — 10 req per minute.
 * Prevents AI API quota abuse.
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: rateLimitMessage('AI request limit reached. Please wait a moment before trying again.'),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict limiter for upload endpoints — 30 req per 10 min.
 */
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: rateLimitMessage('Upload limit reached. Please wait before uploading again.'),
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter, aiLimiter, uploadLimiter };
