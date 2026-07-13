const express = require('express');
const router = express.Router();
const { forecastDemand } = require('../controllers/forecast.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/demand', requireAuth, requireRole(['FARMER', 'ADMIN']), aiLimiter, forecastDemand);

module.exports = router;
