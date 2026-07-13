const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weather.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/:district', requireAuth, getWeather);

module.exports = router;
