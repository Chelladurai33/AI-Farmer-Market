const express = require('express');
const router = express.Router();
const { predictPrice, getPriceHistory } = require('../controllers/prediction.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/price', requireAuth, requireRole(['FARMER']), aiLimiter, predictPrice);
router.get('/price/history', requireAuth, requireRole(['FARMER']), getPriceHistory);

module.exports = router;
