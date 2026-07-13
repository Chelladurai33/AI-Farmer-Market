const express = require('express');
const router = express.Router();
const { getMe, updateMe, updateAvatar } = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);
router.put('/me/avatar', requireAuth, uploadSingle, updateAvatar);

module.exports = router;
