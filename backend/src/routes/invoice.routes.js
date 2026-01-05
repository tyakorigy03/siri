// src/routes/invoice.routes.js - Invoice Routes
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Get all invoices
router.get('/', invoiceController.getAllInvoices);

// Get overdue invoices
router.get('/overdue', invoiceController.getOverdueInvoices);

// Get specific invoice
router.get('/:saleId', invoiceController.getInvoice);

// Get invoice PDF data
router.get('/:saleId/pdf-data', invoiceController.getInvoicePDFData);

// Send reminder
router.post(
  '/:saleId/reminder',
  authorize('accountant', 'manager', 'owner'),
  invoiceController.sendInvoiceReminder
);

module.exports = router;