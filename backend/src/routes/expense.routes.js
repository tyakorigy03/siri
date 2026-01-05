// src/routes/expense.routes.js - Expense Routes
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { protect, authorize } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');
const { validate, schemas } = require('../middlewares/validate');

// All routes require authentication
router.use(protect);

// Expense categories
router.get('/categories', expenseController.getExpenseCategories);

router.post(
  '/categories',
  authorize('manager', 'owner'),
  expenseController.createExpenseCategory
);

// Expenses
router.get('/', expenseController.getExpenses);
router.get('/summary', expenseController.getExpenseSummary);
router.get('/:id', expenseController.getExpense);

router.post(
  '/',
  uploadSingle('receipt', 'receipts'),
  validate(schemas.createExpense),
  expenseController.createExpense
);

router.put(
  '/:id/approve',
  authorize('manager', 'owner'),
  expenseController.approveExpense
);

router.put(
  '/:id/pay',
  authorize('accountant', 'manager', 'owner'),
  expenseController.markExpenseAsPaid
);

module.exports = router;
