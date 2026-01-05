
// src/routes/inventory.routes.js - Inventory Routes
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { protect, authorize } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

// All routes require authentication
router.use(protect);

// Get routes (all authenticated users can view inventory)
router.get('/stock', inventoryController.getStockLevels);
router.get('/movements', inventoryController.getStockMovements);
router.get('/valuation', inventoryController.getInventoryValuation);
router.get('/alerts', inventoryController.getLowStockAlerts);

// Stock adjustment (storekeeper, manager, owner)
router.post(
  '/adjustment',
  authorize('storekeeper', 'manager', 'owner'),
  validate(schemas.stockAdjustment),
  inventoryController.createStockAdjustment
);

// Stock transfer (storekeeper, manager, owner)
router.post(
  '/transfer',
  authorize('storekeeper', 'manager', 'owner'),
  inventoryController.createStockTransfer
);

module.exports = router;