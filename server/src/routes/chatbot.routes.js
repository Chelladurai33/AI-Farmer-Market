const express = require('express');
const router = express.Router();
const { sendMessage } = require('../controllers/chatbot.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/message', requireAuth, aiLimiter, sendMessage);

module.exports = router;
