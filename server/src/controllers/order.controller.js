
const { z } = require('zod');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');
const notificationService = require('../services/notification.service');

const prisma = require('../utils/prisma');

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    price: z.number().positive(),
  })).min(1),
});

const createOrder = async (req, res, next) => {
  try {
    const result = createOrderSchema.safeParse(req.body);
    if (!result.success) {
      return sendValidationError(res, result.error.flatten().fieldErrors);
    }

    const { items } = result.data;
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const order = await prisma.order.create({
      data: {
        buyerId: req.user.id,
        totalAmount,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: { include: { product: { include: { farmer: { select: { id: true, name: true } } } } } },
        buyer: { select: { name: true, email: true } },
      },
    });

    // Notify farmers
    const farmerIds = [...new Set(order.items.map(i => i.product.farmer.id))];
    for (const farmerId of farmerIds) {
      await notificationService.create(farmerId, 'NEW_ORDER',
        `New order received from ${order.buyer.name} for ₹${totalAmount.toFixed(2)}`);
    }

    return sendSuccess(res, order, 201, 'Order placed successfully');
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let where = {};
    if (req.user.role === 'BUYER') {
      where.buyerId = req.user.id;
    } else if (req.user.role === 'FARMER') {
      where.items = { some: { product: { farmerId: req.user.id } } };
    }
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: { select: { name: true, imageUrl: true, unit: true } } } },
          buyer: { select: { name: true, email: true, phone: true } },
          payment: { select: { status: true, method: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    return sendSuccess(res, { orders, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { product: { include: { farmer: { select: { name: true, phone: true } } } } } },
        buyer: { select: { name: true, email: true, phone: true } },
        payment: true,
      },
    });
    if (!order) return sendError(res, 'Order not found', 404);

    if (req.user.role === 'BUYER' && order.buyerId !== req.user.id) {
      return sendError(res, 'Not authorized', 403);
    }

    return sendSuccess(res, order);
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ACCEPTED', 'REJECTED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Valid values: ${validStatuses.join(', ')}`, 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { buyer: { select: { id: true, name: true } } },
    });
    if (!order) return sendError(res, 'Order not found', 404);

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { items: { include: { product: true } }, buyer: true },
    });

    // Notify buyer
    await notificationService.create(order.buyer.id, 'ORDER_UPDATE',
      `Your order status has been updated to ${status}`);

    return sendSuccess(res, updated, 200, `Order ${status.toLowerCase()} successfully`);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };
