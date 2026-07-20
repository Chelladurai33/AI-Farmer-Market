const { z } = require('zod');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger');
const prisma = require('../utils/prisma');

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().positive('Quantity must be positive'),
        price: z.number().positive('Price must be positive'),
      })
    )
    .min(1, 'Order must have at least one item'),
});

// ─── POST /orders ──────────────────────────────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const result = createOrderSchema.safeParse(req.body);
    if (!result.success) {
      return sendValidationError(res, result.error.flatten().fieldErrors);
    }

    const { items } = result.data;

    // Validate all products exist and are active
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true, farmerId: true, name: true },
    });

    if (products.length !== productIds.length) {
      return sendError(res, 'One or more products are unavailable or do not exist.', 422);
    }

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Use a transaction to ensure atomicity
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          buyerId: req.user.id,
          totalAmount,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: { include: { farmer: { select: { id: true, name: true } } } },
            },
          },
          buyer: { select: { name: true, email: true } },
        },
      });
      return created;
    });

    // Notify farmers asynchronously (non-blocking)
    const farmerIds = [...new Set(order.items.map((i) => i.product.farmer.id))];
    Promise.all(
      farmerIds.map((farmerId) =>
        notificationService.create(
          farmerId,
          'NEW_ORDER',
          `New order from ${order.buyer.name} for ₹${totalAmount.toFixed(2)}`
        )
      )
    ).catch((err) => logger.error('Order notification error:', err));

    return sendSuccess(res, order, 201, 'Order placed successfully');
  } catch (err) {
    next(err);
  }
};

// ─── GET /orders ───────────────────────────────────────────────────────────────
const getOrders = async (req, res, next) => {
  try {
    const { page = '1', limit = '10', status } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (req.user.role === 'BUYER') {
      where.buyerId = req.user.id;
    } else if (req.user.role === 'FARMER') {
      where.items = { some: { product: { farmerId: req.user.id } } };
    }
    // ADMIN sees all orders
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: { product: { select: { name: true, imageUrl: true, unit: true } } },
          },
          buyer: { select: { name: true, email: true, phone: true } },
          payment: { select: { status: true, method: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    return sendSuccess(res, {
      orders,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /orders/:id ──────────────────────────────────────────────────────────
const getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: { product: { include: { farmer: { select: { name: true, phone: true } } } } },
        },
        buyer: { select: { name: true, email: true, phone: true } },
        payment: true,
      },
    });

    if (!order) return sendError(res, 'Order not found.', 404);

    // Authorization: buyer can only see their own orders, farmer can see orders with their products
    if (req.user.role === 'BUYER' && order.buyerId !== req.user.id) {
      return sendError(res, 'Not authorized to view this order.', 403);
    }
    if (req.user.role === 'FARMER') {
      const hasFarmerProduct = order.items.some(
        (item) => item.product.farmer && item.product.farmerId === req.user.id
      );
      if (!hasFarmerProduct) return sendError(res, 'Not authorized to view this order.', 403);
    }

    return sendSuccess(res, order);
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /orders/:id/status ──────────────────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return sendError(res, 'Status is required.', 400);

    const validStatuses = ['ACCEPTED', 'REJECTED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Valid values: ${validStatuses.join(', ')}.`, 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        buyer: { select: { id: true, name: true } },
        items: { include: { product: { select: { farmerId: true } } } },
      },
    });
    if (!order) return sendError(res, 'Order not found.', 404);

    // Farmers can only update orders with their products
    if (req.user.role === 'FARMER') {
      const isOrderFarmer = order.items.some((i) => i.product.farmerId === req.user.id);
      if (!isOrderFarmer) return sendError(res, 'Not authorized to update this order.', 403);
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        items: { include: { product: true } },
        buyer: true,
      },
    });

    // Notify buyer asynchronously
    notificationService
      .create(order.buyer.id, 'ORDER_UPDATE', `Your order status has been updated to ${status}.`)
      .catch((err) => logger.error('Status notification error:', err));

    return sendSuccess(res, updated, 200, `Order ${status.toLowerCase()} successfully`);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };
