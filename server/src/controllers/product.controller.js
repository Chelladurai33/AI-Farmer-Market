
const { z } = require('zod');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');
const cloudinaryService = require('../services/cloudinary.service');

const prisma = require('../utils/prisma');

const productSchema = z.object({
  name: z.string().min(2),
  categoryId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  expectedPrice: z.coerce.number().positive(),
  harvestDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  subDistrict: z.string().optional(),
  village: z.string().transform(val => val.trim() || 'N/A'),
  district: z.string().min(1),
  state: z.string().transform(val => val.trim() || 'Tamil Nadu'),
  description: z.string().optional(),
});

const getProducts = async (req, res, next) => {
  try {
    const {
      category, district, minPrice, maxPrice,
      sort = 'latest', page = 1, limit = 12, search
    } = req.query;

    const where = { isActive: true };
    if (category) where.categoryId = category;
    if (district) where.district = { contains: district, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.expectedPrice = {};
      if (minPrice) where.expectedPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.expectedPrice.lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = sort === 'price_asc' ? { expectedPrice: 'asc' }
      : sort === 'price_desc' ? { expectedPrice: 'desc' }
      : sort === 'rating' ? { createdAt: 'desc' }
      : { createdAt: 'desc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          farmer: { select: { id: true, name: true, district: true, avatarUrl: true } },
          category: { select: { id: true, name: true } },
          reviews: { select: { rating: true } },
        },
        orderBy,
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithRating = products.map(p => ({
      ...p,
      avgRating: p.reviews.length ? p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length : 0,
      reviewCount: p.reviews.length,
    }));

    return sendSuccess(res, {
      products: productsWithRating,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    next(err);
  }
};

const getMyProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { farmerId: req.user.id },
      include: {
        category: true,
        orderItems: { select: { quantity: true, price: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, products);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        farmer: { select: { id: true, name: true, district: true, avatarUrl: true, phone: true } },
        category: true,
        reviews: {
          include: { user: { select: { name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!product) return sendError(res, 'Product not found', 404);
    return sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const result = productSchema.safeParse(req.body);
    if (!result.success) {
      return sendValidationError(res, result.error.flatten().fieldErrors);
    }

    let imageUrl = 'https://images.unsplash.com/photo-1595761387015-8cf49d20e6fc?w=400';
    if (req.file) {
      try {
        const uploaded = await cloudinaryService.uploadImage(req.file.buffer, 'products');
        imageUrl = uploaded.secure_url;
      } catch (err) {
        console.warn('Cloudinary upload failed, falling back to base64 data URL:', err.message);
        const base64 = req.file.buffer.toString('base64');
        imageUrl = `data:${req.file.mimetype};base64,${base64}`;
      }
    }

    const product = await prisma.product.create({
      data: {
        ...result.data,
        farmerId: req.user.id,
        imageUrl,
        harvestDate: new Date(result.data.harvestDate),
      },
      include: { category: true },
    });

    return sendSuccess(res, product, 201, 'Product created successfully');
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Product not found', 404);
    if (existing.farmerId !== req.user.id) return sendError(res, 'Not authorized', 403);

    const result = productSchema.partial().safeParse(req.body);
    if (!result.success) {
      return sendValidationError(res, result.error.flatten().fieldErrors);
    }

    let updateData = { ...result.data };
    if (req.file) {
      try {
        const uploaded = await cloudinaryService.uploadImage(req.file.buffer, 'products');
        updateData.imageUrl = uploaded.secure_url;
      } catch (err) {
        console.warn('Cloudinary upload failed, falling back to base64 data URL:', err.message);
        const base64 = req.file.buffer.toString('base64');
        updateData.imageUrl = `data:${req.file.mimetype};base64,${base64}`;
      }
    }
    if (result.data.harvestDate) {
      updateData.harvestDate = new Date(result.data.harvestDate);
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
      include: { category: true },
    });

    return sendSuccess(res, product, 200, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Product not found', 404);
    if (existing.farmerId !== req.user.id) return sendError(res, 'Not authorized', 403);

    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    return sendSuccess(res, null, 200, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getMyProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories };
