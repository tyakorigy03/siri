
// src/routes/customer.routes.js - Customer Routes
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { protect, authorize } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

// All routes require authentication
router.use(protect);

// Get routes (all authenticated users)
router.get('/', customerController.getCustomers);
router.get('/groups', customerController.getCustomerGroups);
router.get('/:id', customerController.getCustomer);
router.get('/:id/statement', customerController.getCustomerStatement);

// Create/Update routes (cashier, receptionist, salesperson, manager, owner)
router.post(
  '/',
  authorize('cashier', 'receptionist', 'salesperson', 'manager', 'owner'),
  validate(schemas.createCustomer),
  customerController.createCustomer
);

router.put(
  '/:id',
  authorize('cashier', 'receptionist', 'salesperson', 'manager', 'owner'),
  customerController.updateCustomer
);

// Delete route (manager, owner only)
router.delete(
  '/:id',
  authorize('manager', 'owner'),
  customerController.deleteCustomer
);

module.exports = router;