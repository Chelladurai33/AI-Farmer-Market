const express = require('express');
const router = express.Router();
const {
  getStats, getFarmers, getBuyers, getAdminOrders,
  verifyUser, suspendUser, manageColdStorages, getReports,
  updateColdStorage, deleteColdStorage
} = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const adminOnly = [requireAuth, requireRole(['ADMIN'])];

router.get('/stats', getStats); // Public-safe subset for landing page
router.get('/farmers', ...adminOnly, getFarmers);
router.get('/buyers', ...adminOnly, getBuyers);
router.get('/orders', ...adminOnly, getAdminOrders);
router.get('/reports', ...adminOnly, getReports);
router.get('/cold-storages', ...adminOnly, manageColdStorages);
router.patch('/users/:id/verify', ...adminOnly, verifyUser);
router.patch('/users/:id/suspend', ...adminOnly, suspendUser);
router.put('/cold-storages/:id', ...adminOnly, updateColdStorage);
router.delete('/cold-storages/:id', ...adminOnly, deleteColdStorage);

module.exports = router;
