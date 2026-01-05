// src/routes/cashbook.routes.js - Cash Book Routes
const express = require('express');
const router = express.Router();
const cashbookController = require('../controllers/cashbook.controller');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Business day management (manager, owner)
router.post(
  '/business-day/open',
  authorize('manager', 'owner'),
  cashbookController.openBusinessDay
);

router.post(
  '/business-day/close',
  authorize('manager', 'owner'),
  cashbookController.closeBusinessDay
);

router.get(
  '/business-day/current',
  cashbookController.getCurrentBusinessDay
);

router.get(
  '/business-day/history',
  cashbookController.getBusinessDayHistory
);

// Cashbook entries
router.get('/entries', cashbookController.getCashbookEntries);

router.post(
  '/entries',
  authorize('cashier', 'manager', 'owner'),
  cashbookController.addCashbookEntry
);

// Reports
router.get(
  '/variance-report',
  authorize('accountant', 'manager', 'owner'),
  cashbookController.getCashVarianceReport
);

module.exports = router;