// src/controllers/expense.controller.js - Expense Management Controller
const db = require('../config/database');
const { successResponse, errorResponse, createdResponse, notFoundResponse, paginatedResponse, badRequestResponse } = require('../utils/response');
const { generateId } = require('../utils/generateId');

/**
 * @desc    Get all expenses
 * @route   GET /api/v1/expenses
 * @access  Private
 */
exports.getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 20, branch_id, category_id, status, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        e.*,
        ec.name as category_name,
        b.name as branch_name,
        u2.name as approved_by_name,
        CASE 
          WHEN e.description LIKE '%[REJECTED]%' THEN 'REJECTED'
          WHEN e.status = 'DRAFT' THEN 'pending'
          WHEN e.status = 'APPROVED' THEN 'approved'
          WHEN e.status = 'PAID' THEN 'paid'
          ELSE e.status
        END as display_status,
        0 as has_receipt
      FROM expenses e
      INNER JOIN expense_categories ec ON e.category_id = ec.id
      INNER JOIN branches b ON e.branch_id = b.id
      LEFT JOIN users u2 ON e.approved_by = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (branch_id) {
      query += ' AND e.branch_id = ?';
      params.push(branch_id);
    }

    if (category_id) {
      query += ' AND e.category_id = ?';
      params.push(category_id);
    }

    if (status) {
      if (status === 'REJECTED') {
        query += ' AND e.description LIKE ?';
        params.push('%[REJECTED]%');
      } else if (status === 'pending') {
        query += ' AND e.status = "DRAFT" AND e.description NOT LIKE ?';
        params.push('%[REJECTED]%');
      } else {
        query += ' AND e.status = ? AND e.description NOT LIKE ?';
        params.push(status, '%[REJECTED]%');
      }
    }

    if (date_from) {
      query += ' AND e.expense_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND e.expense_date <= ?';
      params.push(date_to);
    }

    // Get total count - build count query from the base query
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      'SELECT COUNT(*) as total FROM'
    );
    // Remove ORDER BY and LIMIT from count query
    const cleanCountQuery = countQuery.split('ORDER BY')[0];
    const [countResult] = await db.query(cleanCountQuery, params);
    const total = countResult && countResult[0] ? countResult[0].total : 0;

    query += ' ORDER BY e.expense_date DESC, e.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [expenses] = await db.query(query, params);

    return paginatedResponse(res, expenses, parseInt(page), parseInt(limit), total, 'Expenses retrieved successfully');

  } catch (error) {
    console.error('Get expenses error:', error);
    return errorResponse(res, 500, 'Error retrieving expenses', error);
  }
};

/**
 * @desc    Get single expense
 * @route   GET /api/v1/expenses/:id
 * @access  Private
 */
exports.getExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const [expenses] = await db.query(`
      SELECT 
        e.*,
        ec.name as category_name,
        b.name as branch_name,
        u2.name as approved_by_name,
        CASE 
          WHEN e.description LIKE '%[REJECTED]%' THEN 'REJECTED'
          WHEN e.status = 'DRAFT' THEN 'pending'
          WHEN e.status = 'APPROVED' THEN 'approved'
          WHEN e.status = 'PAID' THEN 'paid'
          ELSE e.status
        END as display_status,
        0 as has_receipt
      FROM expenses e
      INNER JOIN expense_categories ec ON e.category_id = ec.id
      INNER JOIN branches b ON e.branch_id = b.id
      LEFT JOIN users u2 ON e.approved_by = u2.id
      WHERE e.id = ?
    `, [id]);

    if (expenses.length === 0) {
      return notFoundResponse(res, 'Expense not found');
    }

    return successResponse(res, 200, 'Expense retrieved successfully', expenses[0]);

  } catch (error) {
    console.error('Get expense error:', error);
    return errorResponse(res, 500, 'Error retrieving expense', error);
  }
};

/**
 * @desc    Create expense
 * @route   POST /api/v1/expenses
 * @access  Private
 */
exports.createExpense = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      business_id,
      branch_id,
      category_id,
      expense_date,
      amount,
      vat_amount,
      payment_method,
      payee,
      description
    } = req.body;

    // Handle receipt upload if exists
    let receipt_url = null;
    if (req.cloudinaryResult) {
      receipt_url = req.cloudinaryResult.url;
    }

    const expenseId = generateId('EXP', Date.now());
    
    // Note: receipt_url and requested_by fields may need to be added to the expenses table schema
    // For now, we'll only insert fields that exist in the schema
    await connection.query(`
      INSERT INTO expenses (
        id, business_id, branch_id, category_id, expense_date,
        amount, vat_amount, payment_method, payee, description,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', NOW())
    `, [
      expenseId,
      business_id,
      branch_id,
      category_id,
      expense_date,
      amount,
      vat_amount || 0,
      payment_method,
      payee,
      description || null
    ]);

    // Create cashbook entry if paid
    if (payment_method === 'CASH') {
      const cashbookId = generateId('CB', Date.now());
      await connection.query(`
        INSERT INTO cashbook_entries (
          id, business_id, branch_id, entry_type, source,
          amount, reference_id, description, created_at
        ) VALUES (?, ?, ?, 'OUT', 'EXPENSE', ?, ?, ?, NOW())
      `, [cashbookId, business_id, branch_id, amount, expenseId, `Expense: ${payee}`]);
    }

    await connection.commit();

    const [expense] = await connection.query('SELECT * FROM expenses WHERE id = ?', [expenseId]);

    return createdResponse(res, 'Expense created successfully', expense[0]);

  } catch (error) {
    await connection.rollback();
    console.error('Create expense error:', error);
    return errorResponse(res, 500, 'Error creating expense', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Approve expense
 * @route   PUT /api/v1/expenses/:id/approve
 * @access  Private (manager, owner)
 */
exports.approveExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const [expenses] = await db.query('SELECT * FROM expenses WHERE id = ?', [id]);
    
    if (expenses.length === 0) {
      return notFoundResponse(res, 'Expense not found');
    }

    if (expenses[0].status === 'APPROVED') {
      return badRequestResponse(res, 'Expense already approved');
    }

    if (expenses[0].status === 'PAID') {
      return badRequestResponse(res, 'Cannot approve an already paid expense');
    }

    await db.query(
      'UPDATE expenses SET status = "APPROVED", approved_by = ? WHERE id = ?',
      [req.user.id, id]
    );

    return successResponse(res, 200, 'Expense approved successfully');

  } catch (error) {
    console.error('Approve expense error:', error);
    return errorResponse(res, 500, 'Error approving expense', error);
  }
};

/**
 * @desc    Reject expense
 * @route   PUT /api/v1/expenses/:id/reject
 * @access  Private (manager, owner)
 */
exports.rejectExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason || rejection_reason.trim() === '') {
      return badRequestResponse(res, 'Rejection reason is required');
    }

    const [expenses] = await db.query('SELECT * FROM expenses WHERE id = ?', [id]);
    
    if (expenses.length === 0) {
      return notFoundResponse(res, 'Expense not found');
    }

    if (expenses[0].status === 'PAID') {
      return badRequestResponse(res, 'Cannot reject an already paid expense');
    }

    // Update description to include rejection reason, or we can add a rejection_reason field
    // For now, we'll append to description and set status back to DRAFT
    const updatedDescription = expenses[0].description 
      ? `${expenses[0].description}\n\n[REJECTED] Reason: ${rejection_reason}`
      : `[REJECTED] Reason: ${rejection_reason}`;

    await db.query(
      'UPDATE expenses SET status = "DRAFT", description = ?, approved_by = NULL WHERE id = ?',
      [updatedDescription, id]
    );

    return successResponse(res, 200, 'Expense rejected successfully');

  } catch (error) {
    console.error('Reject expense error:', error);
    return errorResponse(res, 500, 'Error rejecting expense', error);
  }
};

/**
 * @desc    Mark expense as paid
 * @route   PUT /api/v1/expenses/:id/pay
 * @access  Private (accountant, manager, owner)
 */
exports.markExpenseAsPaid = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [expenses] = await connection.query('SELECT * FROM expenses WHERE id = ?', [id]);
    
    if (expenses.length === 0) {
      await connection.rollback();
      return notFoundResponse(res, 'Expense not found');
    }

    const expense = expenses[0];

    if (expense.status === 'PAID') {
      await connection.rollback();
      return badRequestResponse(res, 'Expense already paid');
    }

    await connection.query(
      'UPDATE expenses SET status = "PAID" WHERE id = ?',
      [id]
    );

    // Create cashbook entry if not cash (cash was already recorded at creation)
    if (expense.payment_method !== 'CASH') {
      const cashbookId = generateId('CB', Date.now());
      await connection.query(`
        INSERT INTO cashbook_entries (
          id, business_id, branch_id, entry_type, source,
          amount, reference_id, description, created_at
        ) VALUES (?, ?, ?, 'OUT', 'EXPENSE', ?, ?, ?, NOW())
      `, [
        cashbookId,
        expense.business_id,
        expense.branch_id,
        expense.amount,
        id,
        `Expense payment: ${expense.payee}`
      ]);
    }

    await connection.commit();

    return successResponse(res, 200, 'Expense marked as paid successfully');

  } catch (error) {
    await connection.rollback();
    console.error('Mark expense as paid error:', error);
    return errorResponse(res, 500, 'Error marking expense as paid', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Get expense categories
 * @route   GET /api/v1/expenses/categories
 * @access  Private
 */
exports.getExpenseCategories = async (req, res) => {
  try {
    const { business_id } = req.query;

    const [categories] = await db.query(`
      SELECT 
        ec.*,
        COUNT(e.id) as expense_count,
        SUM(CASE WHEN e.status = 'PAID' THEN e.amount ELSE 0 END) as total_spent
      FROM expense_categories ec
      LEFT JOIN expenses e ON ec.id = e.category_id
      WHERE ec.business_id = ? AND ec.active = TRUE
      GROUP BY ec.id
      ORDER BY ec.name
    `, [business_id || 1]);

    return successResponse(res, 200, 'Expense categories retrieved successfully', categories);

  } catch (error) {
    console.error('Get expense categories error:', error);
    return errorResponse(res, 500, 'Error retrieving expense categories', error);
  }
};

/**
 * @desc    Create expense category
 * @route   POST /api/v1/expenses/categories
 * @access  Private (manager, owner)
 */
exports.createExpenseCategory = async (req, res) => {
  try {
    const { business_id, name, code, is_tax_deductible, description } = req.body;

    const [result] = await db.query(`
      INSERT INTO expense_categories (
        business_id, name, code, is_tax_deductible, description, active
      ) VALUES (?, ?, ?, ?, ?, TRUE)
    `, [
      business_id,
      name,
      code || null,
      is_tax_deductible !== false,
      description || null
    ]);

    const [category] = await db.query(
      'SELECT * FROM expense_categories WHERE id = ?',
      [result.insertId]
    );

    return createdResponse(res, 'Expense category created successfully', category[0]);

  } catch (error) {
    console.error('Create expense category error:', error);
    return errorResponse(res, 500, 'Error creating expense category', error);
  }
};

/**
 * @desc    Get expense summary
 * @route   GET /api/v1/expenses/summary
 * @access  Private
 */
exports.getExpenseSummary = async (req, res) => {
  try {
    const { branch_id, date_from, date_to } = req.query;

    let query = `
      SELECT 
        COUNT(*) as total_expenses,
        SUM(amount) as total_amount,
        SUM(vat_amount) as total_vat,
        AVG(amount) as average_expense,
        SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN status = 'APPROVED' THEN amount ELSE 0 END) as approved_amount,
        SUM(CASE WHEN status = 'DRAFT' THEN amount ELSE 0 END) as pending_amount
      FROM expenses
      WHERE 1=1
    `;
    const params = [];

    if (branch_id) {
      query += ' AND branch_id = ?';
      params.push(branch_id);
    }

    if (date_from) {
      query += ' AND expense_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND expense_date <= ?';
      params.push(date_to);
    }

    const [summary] = await db.query(query, params);

    // Get by category
    let categoryQuery = `
      SELECT 
        ec.name as category_name,
        COUNT(e.id) as expense_count,
        SUM(e.amount) as total_amount
      FROM expenses e
      INNER JOIN expense_categories ec ON e.category_id = ec.id
      WHERE 1=1
    `;
    const categoryParams = [];

    if (branch_id) {
      categoryQuery += ' AND e.branch_id = ?';
      categoryParams.push(branch_id);
    }

    if (date_from) {
      categoryQuery += ' AND e.expense_date >= ?';
      categoryParams.push(date_from);
    }

    if (date_to) {
      categoryQuery += ' AND e.expense_date <= ?';
      categoryParams.push(date_to);
    }

    categoryQuery += ' GROUP BY ec.id, ec.name ORDER BY total_amount DESC';

    const [byCategory] = await db.query(categoryQuery, categoryParams);

    return successResponse(res, 200, 'Expense summary retrieved successfully', {
      summary: summary[0],
      by_category: byCategory
    });

  } catch (error) {
    console.error('Get expense summary error:', error);
    return errorResponse(res, 500, 'Error retrieving expense summary', error);
  }
};

module.exports = exports;