// src/routes/index.js - Main Routes Aggregator
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const salesRoutes = require('./sales.routes');
const customerRoutes = require('./customer.routes');
const inventoryRoutes = require('./inventory.routes');
const reportRoutes = require('./report.routes');
const cashbookRoutes = require('./cashbook.routes');
const expenseRoutes = require('./expense.routes');
const purchaseRoutes = require('./purchase.routes');
const invoiceRoutes = require('./invoice.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/sales', salesRoutes);
router.use('/customers', customerRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/reports', reportRoutes);
router.use('/cashbook', cashbookRoutes);
router.use('/expenses', expenseRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/invoices', invoiceRoutes);

// API info route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Business Management System API - Complete Version',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      auth: '/auth - Authentication & user management',
      products: '/products - Product catalog & inventory items',
      sales: '/sales - POS transactions & sales management',
      customers: '/customers - Customer management & statements',
      inventory: '/inventory - Stock levels, movements & transfers',
      reports: '/reports - Business intelligence & analytics',
      cashbook: '/cashbook - Cash flow & daily reconciliation',
      expenses: '/expenses - Expense tracking & approvals',
      purchases: '/purchases - Purchase orders & supplier invoices',
      invoices: '/invoices - Customer invoicing & payment tracking'
    },
    features: [
      '✅ Multi-branch operations',
      '✅ Real-time inventory tracking',
      '✅ Cash flow management',
      '✅ VAT compliance',
      '✅ Accounts payable/receivable',
      '✅ Expense management',
      '✅ Purchase order system',
      '✅ Invoice generation',
      '✅ Comprehensive reporting',
      '✅ Role-based access control'
    ],
    documentation: 'See README.md for full API documentation'
  });
});

module.exports = router;