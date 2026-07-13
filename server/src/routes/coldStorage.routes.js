const express = require('express');
const router = express.Router();
const {
  getNearbyColdStorages, createColdStorage, bookStorage
} = require('../controllers/coldStorage.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.get('/nearby', requireAuth, getNearbyColdStorages);
router.post('/', requireAuth, requireRole(['ADMIN']), createColdStorage);
router.post('/:id/book', requireAuth, requireRole(['FARMER']), bookStorage);

module.exports = router;
