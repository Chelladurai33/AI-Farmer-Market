const express = require('express');
const router = express.Router();
const { register, login, logout, refreshToken, forgotPassword } = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);

module.exports = router;
