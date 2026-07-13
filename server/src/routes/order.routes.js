const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus } = require('../controllers/order.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.get('/', requireAuth, getOrders);
router.post('/', requireAuth, requireRole(['BUYER']), createOrder);
router.get('/:id', requireAuth, getOrderById);
router.patch('/:id/status', requireAuth, requireRole(['FARMER', 'ADMIN']), updateOrderStatus);

module.exports = router;
