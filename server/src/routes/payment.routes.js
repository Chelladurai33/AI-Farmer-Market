const express = require('express');
const router = express.Router();
const { createPayment, getPaymentByOrder } = require('../controllers/payment.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.post('/', requireAuth, requireRole(['BUYER']), createPayment);
router.get('/:orderId', requireAuth, getPaymentByOrder);

module.exports = router;
