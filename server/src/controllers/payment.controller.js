
const { z } = require('zod');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');
const pdfService = require('../services/pdf.service');

const prisma = require('../utils/prisma');

const paymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['UPI', 'CARD', 'NETBANKING', 'COD']),
});

const createPayment = async (req, res, next) => {
  try {
    const result = paymentSchema.safeParse(req.body);
    if (!result.success) {
      return sendValidationError(res, result.error.flatten().fieldErrors);
    }
    const { orderId, method } = result.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { name: true, unit: true } } } },
        buyer: { select: { name: true, email: true } },
        payment: true,
      },
    });
    if (!order) return sendError(res, 'Order not found', 404);
    if (order.buyerId !== req.user.id) return sendError(res, 'Not authorized', 403);
    if (order.payment) return sendError(res, 'Payment already exists for this order', 409);

    // Simulate payment (stub gateway)
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: order.totalAmount,
        status: 'SUCCESS',
        method,
      },
    });

    // Update order status
    await prisma.order.update({ where: { id: orderId }, data: { status: 'ACCEPTED' } });

    // Generate PDF invoice
    let pdfUrl = null;
    try {
      pdfUrl = await pdfService.generateInvoice(order, payment);
    } catch (e) {
      // PDF generation is non-critical
    }

    return sendSuccess(res, { payment, invoicePdfUrl: pdfUrl }, 201, 'Payment successful');
  } catch (err) {
    next(err);
  }
};

const getPaymentByOrder = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { orderId: req.params.orderId },
      include: { order: { include: { buyer: { select: { name: true, email: true } } } } },
    });
    if (!payment) return sendError(res, 'Payment not found', 404);
    return sendSuccess(res, payment);
  } catch (err) {
    next(err);
  }
};

module.exports = { createPayment, getPaymentByOrder };
