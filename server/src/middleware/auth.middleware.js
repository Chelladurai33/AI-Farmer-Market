const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const prisma = require('../utils/prisma');

/**
 * requireAuth — verifies JWT and attaches user to req.
 * Throws 401 if token is missing/invalid, 403 if account suspended.
 */
const requireAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new AppError('Malformed authorization header.', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (jwtErr) {
      // Let errorHandler classify JsonWebTokenError / TokenExpiredError
      return next(jwtErr);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, isVerified: true },
    });

    if (!user) {
      return next(new AppError('User account no longer exists. Please log in again.', 401));
    }

    if (!user.isVerified) {
      return next(new AppError('Your account is suspended or not yet verified.', 403));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * requireRole — role-based access control.
 * Must be used AFTER requireAuth.
 */
const requireRole = (roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(`Access denied. Requires role: ${roles.join(' or ')}.`, 403)
    );
  }
  next();
};

/**
 * optionalAuth — attaches user if valid token present, never throws.
 * Useful for public routes that show extra info to logged-in users.
 */
const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, name: true, email: true, role: true, isVerified: true },
        });
        if (user && user.isVerified) {
          req.user = user;
        }
      }
    }
  } catch {
    // Silent fail — optional auth should never block the request
  }
  next();
};

module.exports = { requireAuth, requireRole, optionalAuth };
