const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { z } = require('zod');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');

const prisma = require('../utils/prisma');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
};

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['FARMER', 'BUYER']).default('BUYER'),
  phone: z.string().optional(),
  subDistrict: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const register = async (req, res, next) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return sendValidationError(res, result.error.flatten().fieldErrors);
    }
    const { name, email, password, role, phone, subDistrict, village, district, state, latitude, longitude } = result.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, phone, subDistrict, village, district, state, latitude, longitude },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, { user, accessToken }, 201, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return sendValidationError(res, result.error.flatten().fieldErrors);
    }
    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (!user.isVerified) {
      return sendError(res, 'Your account is suspended or unverified.', 403);
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userWithoutPassword } = user;
    return sendSuccess(res, { user: userWithoutPassword, accessToken }, 200, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  return sendSuccess(res, null, 200, 'Logged out successfully');
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return sendError(res, 'Refresh token not found', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isVerified: true },
    });

    if (!user) {
      return sendError(res, 'User not found', 401);
    }

    if (!user.isVerified) {
      return sendError(res, 'Your account is suspended or unverified.', 403);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, { accessToken }, 200, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res) => {
  // Stub: In production, send email with reset link
  return sendSuccess(res, null, 200, 'If this email exists, a reset link has been sent.');
};

module.exports = { register, login, logout, refreshToken, forgotPassword };
