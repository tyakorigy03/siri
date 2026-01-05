
// src/routes/sales.routes.js - Sales Routes
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');
const { protect, authorize } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

// All routes require authentication
router.use(protect);

// Get routes
router.get('/', salesController.getSales);
router.get('/summary', salesController.getSalesSummary);
router.get('/:id', salesController.getSale);

// Create sale (cashier, receptionist, salesperson, manager, owner)
router.post(
  '/',
  authorize('cashier', 'receptionist', 'salesperson', 'manager', 'owner'),
  validate(schemas.createSale),
  salesController.createSale
);

// Add payment to sale
router.post(
  '/:id/payment',
  authorize('cashier', 'receptionist', 'accountant', 'manager', 'owner'),
  salesController.addPayment
);

module.exports = router;