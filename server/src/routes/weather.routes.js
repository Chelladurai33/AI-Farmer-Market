const express = require('express');
const router = express.Router();
const { getWeather, getDistrictList } = require('../controllers/weather.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/districts', requireAuth, getDistrictList);
router.get('/:district', requireAuth, getWeather);

module.exports = router;
