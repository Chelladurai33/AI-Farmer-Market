const express = require('express');
const router = express.Router();
const { analyzeDisease, getDiseaseHistory } = require('../controllers/disease.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/analyze', requireAuth, requireRole(['FARMER']), uploadSingle, aiLimiter, analyzeDisease);
router.get('/history', requireAuth, requireRole(['FARMER']), getDiseaseHistory);

module.exports = router;
