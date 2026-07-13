const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, getNotifications);
router.patch('/:id/read', requireAuth, markAsRead);
router.patch('/mark-all/read', requireAuth, markAllAsRead);

module.exports = router;
