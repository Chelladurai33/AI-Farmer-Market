const express = require('express');
const router = express.Router();
const {
  getProducts, createProduct, getProductById,
  updateProduct, deleteProduct, getMyProducts, getCategories
} = require('../controllers/product.controller');
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

router.get('/', optionalAuth, getProducts);
router.get('/my', requireAuth, requireRole(['FARMER']), getMyProducts);
router.get('/categories', optionalAuth, getCategories);
router.get('/:id', optionalAuth, getProductById);
router.post('/', requireAuth, requireRole(['FARMER']), uploadSingle, createProduct);
router.put('/:id', requireAuth, requireRole(['FARMER']), uploadSingle, updateProduct);
router.delete('/:id', requireAuth, requireRole(['FARMER']), deleteProduct);

module.exports = router;
