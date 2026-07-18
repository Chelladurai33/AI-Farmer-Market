const express = require('express');
const router = express.Router();
const {
  getStats, getFarmers, getBuyers, getAdminOrders,
  verifyUser, suspendUser, manageColdStorages, getReports,
  updateColdStorage, deleteColdStorage, createAdminColdStorage,
  getSolarDryingPlants, createSolarDryingPlant, deleteSolarDryingPlant
} = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const adminOnly = [requireAuth, requireRole(['ADMIN'])];

router.get('/stats', getStats); // Public-safe subset for landing page
router.get('/farmers', ...adminOnly, getFarmers);
router.get('/buyers', ...adminOnly, getBuyers);
router.get('/orders', ...adminOnly, getAdminOrders);
router.get('/reports', ...adminOnly, getReports);
router.get('/cold-storages', ...adminOnly, manageColdStorages);
router.post('/cold-storages', ...adminOnly, createAdminColdStorage);
router.put('/cold-storages/:id', ...adminOnly, updateColdStorage);
router.delete('/cold-storages/:id', ...adminOnly, deleteColdStorage);

router.get('/solar-drying-plants', ...adminOnly, getSolarDryingPlants);
router.post('/solar-drying-plants', ...adminOnly, createSolarDryingPlant);
router.delete('/solar-drying-plants/:id', ...adminOnly, deleteSolarDryingPlant);

router.patch('/users/:id/verify', ...adminOnly, verifyUser);
router.patch('/users/:id/suspend', ...adminOnly, suspendUser);

module.exports = router;
