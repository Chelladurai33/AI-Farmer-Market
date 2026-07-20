const { z } = require('zod');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');
const cloudinaryService = require('../services/cloudinary.service');
const logger = require('../utils/logger');
const prisma = require('../utils/prisma');

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional().or(z.literal('')),
  subDistrict: z.string().max(100).optional(),
  village: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  avatarUrl: true,
  subDistrict: true,
  village: true,
  district: true,
  state: true,
  latitude: true,
  longitude: true,
  isVerified: true,
  createdAt: true,
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: USER_SELECT,
    });
    if (!user) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const result = updateSchema.safeParse(req.body);
    if (!result.success) {
      return sendValidationError(res, result.error.flatten().fieldErrors);
    }

    // Remove empty string values
    const cleanData = Object.fromEntries(
      Object.entries(result.data).filter(([_, v]) => v !== '' && v !== undefined)
    );

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: cleanData,
      select: USER_SELECT,
    });
    return sendSuccess(res, user, 200, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file provided.', 400);
    }

    let avatarUrl;
    try {
      const result = await cloudinaryService.uploadImage(req.file.buffer, 'avatars');
      avatarUrl = result.secure_url;
    } catch (err) {
      logger.warn('Cloudinary avatar upload failed, using base64 fallback:', err.message);
      const base64 = req.file.buffer.toString('base64');
      avatarUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
    return sendSuccess(res, user, 200, 'Avatar updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, updateAvatar };
