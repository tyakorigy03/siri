
// src/routes/report.routes.js - Report Routes
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Dashboard stats (all users can see their relevant dashboard)
router.get('/dashboard', reportController.getDashboardStats);

// Sales reports (cashier, accountant, manager, owner)
router.get(
  '/sales-summary',
  authorize('cashier', 'salesperson', 'accountant', 'manager', 'owner'),
  reportController.getSalesSummary
);

router.get(
  '/sales-by-channel',
  authorize('cashier', 'salesperson', 'accountant', 'manager', 'owner'),
  reportController.getSalesByChannel
);

router.get(
  '/top-products',
  authorize('cashier', 'salesperson', 'storekeeper', 'manager', 'owner'),
  reportController.getTopProducts
);

// Inventory reports (storekeeper, accountant, manager, owner)
router.get(
  '/inventory-valuation',
  authorize('storekeeper', 'accountant', 'manager', 'owner'),
  reportController.getInventoryValuation
);

// Financial reports (accountant, manager, owner only)
router.get(
  '/vat-report',
  authorize('accountant', 'manager', 'owner'),
  reportController.getVATReport
);

router.get(
  '/profit-loss',
  authorize('accountant', 'manager', 'owner'),
  reportController.getProfitLoss
);

router.get(
  '/cash-flow',
  authorize('accountant', 'manager', 'owner'),
  reportController.getCashFlow
);

module.exports = router;