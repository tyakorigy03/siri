
// src/routes/product.routes.js - Product Routes
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');
const { validate, schemas } = require('../middlewares/validate');

// All routes require authentication
router.use(protect);

// Public product routes (all authenticated users)
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProduct);

// Protected routes (manager, owner)
router.post(
  '/',
  authorize('owner', 'manager'),
  uploadSingle('image', 'products'),
  validate(schemas.createProduct),
  productController.createProduct
);

router.put(
  '/:id',
  authorize('owner', 'manager'),
  uploadSingle('image', 'products'),
  validate(schemas.updateProduct),
  productController.updateProduct
);

// Delete route (owner only)
router.delete(
  '/:id',
  authorize('owner'),
  productController.deleteProduct
);

module.exports = router;    