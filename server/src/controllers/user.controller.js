
const { z } = require('zod');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');
const cloudinaryService = require('../services/cloudinary.service');

const prisma = require('../utils/prisma');

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, avatarUrl: true, village: true,
        district: true, state: true, latitude: true, longitude: true,
        isVerified: true, createdAt: true,
      },
    });
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

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: result.data,
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, avatarUrl: true, village: true,
        district: true, state: true, latitude: true, longitude: true,
        isVerified: true,
      },
    });
    return sendSuccess(res, user, 200, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file provided', 400);
    }

    let avatarUrl;
    try {
      const result = await cloudinaryService.uploadImage(req.file.buffer, 'avatars');
      avatarUrl = result.secure_url;
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to base64 data URL:', err.message);
      const base64 = req.file.buffer.toString('base64');
      avatarUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
    return sendSuccess(res, user, 200, 'Avatar updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, updateAvatar };
