
// src/routes/purchase.routes.js - Purchase Routes
const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controller');
const { protect, authorize } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

// All routes require authentication
router.use(protect);

// Purchase Orders
router.get('/orders', purchaseController.getPurchaseOrders);
router.get('/orders/:id', purchaseController.getPurchaseOrder);

router.post(
  '/orders',
  authorize('storekeeper', 'manager', 'owner'),
  validate(schemas.createPurchaseOrder),
  purchaseController.createPurchaseOrder
);

router.put(
  '/orders/:id/approve',
  authorize('manager', 'owner'),
  purchaseController.approvePurchaseOrder
);

// Purchase Invoices
router.get('/invoices', purchaseController.getPurchaseInvoices);

router.post(
  '/invoices',
  authorize('storekeeper', 'manager', 'owner'),
  purchaseController.createPurchaseInvoice
);

router.post(
  '/invoices/:id/pay',
  authorize('accountant', 'manager', 'owner'),
  purchaseController.paySupplier
);

// Accounts Payable
router.get(
  '/payables',
  authorize('accountant', 'manager', 'owner'),
  purchaseController.getAccountsPayable
);

module.exports = router;