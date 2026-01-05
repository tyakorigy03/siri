// src/controllers/customer.controller.js - Customer Controller
const db = require('../config/database');
const { successResponse, errorResponse, createdResponse, notFoundResponse, paginatedResponse, badRequestResponse } = require('../utils/response');

/**
 * @desc    Get all customers
 * @route   GET /api/v1/customers
 * @access  Private
 */
exports.getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, credit_score, customer_group_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, 
        cg.name as customer_group_name,
        cg.discount_percentage as group_discount
      FROM customers c
      LEFT JOIN customer_groups cg ON c.customer_group_id = cg.id
      WHERE c.active = TRUE
    `;
    const params = [];

    // Add filters
    if (search) {
      query += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (credit_score) {
      query += ' AND c.credit_score = ?';
      params.push(credit_score);
    }

    if (customer_group_id) {
      query += ' AND c.customer_group_id = ?';
      params.push(customer_group_id);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT c.*, cg.name as customer_group_name, cg.discount_percentage as group_discount',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Add pagination
    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [customers] = await db.query(query, params);

    return paginatedResponse(res, customers, parseInt(page), parseInt(limit), total, 'Customers retrieved successfully');

  } catch (error) {
    console.error('Get customers error:', error);
    return errorResponse(res, 500, 'Error retrieving customers', error);
  }
};

/**
 * @desc    Get single customer
 * @route   GET /api/v1/customers/:id
 * @access  Private
 */
exports.getCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const [customers] = await db.query(`
      SELECT c.*,
        cg.name as customer_group_name,
        cg.discount_percentage as group_discount
      FROM customers c
      LEFT JOIN customer_groups cg ON c.customer_group_id = cg.id
      WHERE c.id = ?
    `, [id]);

    if (customers.length === 0) {
      return notFoundResponse(res, 'Customer not found');
    }

    const customer = customers[0];

    // Get customer's sales history
    const [sales] = await db.query(`
      SELECT id, sale_number, sale_date, grand_total, payment_status
      FROM sales
      WHERE customer_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [id]);

    // Get outstanding receivables
    const [receivables] = await db.query(`
      SELECT SUM(amount_due - amount_paid) as outstanding
      FROM receivables
      WHERE customer_id = ? AND status IN ('OPEN', 'PARTIAL', 'OVERDUE')
    `, [id]);

    const customerData = {
      ...customer,
      recent_sales: sales,
      outstanding_balance: receivables[0].outstanding || 0
    };

    return successResponse(res, 200, 'Customer retrieved successfully', customerData);

  } catch (error) {
    console.error('Get customer error:', error);
    return errorResponse(res, 500, 'Error retrieving customer', error);
  }
};

/**
 * @desc    Create customer
 * @route   POST /api/v1/customers
 * @access  Private
 */
exports.createCustomer = async (req, res) => {
  try {
    const {
      business_id,
      customer_group_id,
      name,
      phone,
      email,
      tin,
      address,
      credit_allowed,
      credit_limit,
      credit_terms,
      notes
    } = req.body;

    // Check if customer with same phone or email exists
    if (phone) {
      const [existing] = await db.query(
        'SELECT id FROM customers WHERE phone = ? AND business_id = ?',
        [phone, business_id]
      );
      if (existing.length > 0) {
        return badRequestResponse(res, 'Customer with this phone number already exists');
      }
    }

    const [result] = await db.query(`
      INSERT INTO customers (
        business_id, customer_group_id, name, phone, email, tin, address,
        credit_allowed, credit_limit, credit_terms, notes, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `, [
      business_id,
      customer_group_id || null,
      name,
      phone || null,
      email || null,
      tin || null,
      address || null,
      credit_allowed || false,
      credit_limit || 0,
      credit_terms || 30,
      notes || null
    ]);

    const [customer] = await db.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);

    return createdResponse(res, 'Customer created successfully', customer[0]);

  } catch (error) {
    console.error('Create customer error:', error);
    return errorResponse(res, 500, 'Error creating customer', error);
  }
};

/**
 * @desc    Update customer
 * @route   PUT /api/v1/customers/:id
 * @access  Private
 */
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if customer exists
    const [existing] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Customer not found');
    }

    // Build update query
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id' && key !== 'business_id') {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      return badRequestResponse(res, 'No fields to update');
    }

    values.push(id);
    await db.query(
      `UPDATE customers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    const [customer] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);

    return successResponse(res, 200, 'Customer updated successfully', customer[0]);

  } catch (error) {
    console.error('Update customer error:', error);
    return errorResponse(res, 500, 'Error updating customer', error);
  }
};

/**
 * @desc    Delete customer
 * @route   DELETE /api/v1/customers/:id
 * @access  Private (manager, owner)
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const [existing] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Customer not found');
    }

    // Soft delete
    await db.query('UPDATE customers SET active = FALSE WHERE id = ?', [id]);

    return successResponse(res, 200, 'Customer deleted successfully');

  } catch (error) {
    console.error('Delete customer error:', error);
    return errorResponse(res, 500, 'Error deleting customer', error);
  }
};

/**
 * @desc    Get customer statement
 * @route   GET /api/v1/customers/:id/statement
 * @access  Private
 */
exports.getCustomerStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const { date_from, date_to } = req.query;

    let query = `
      SELECT * FROM customer_statements
      WHERE customer_id = ?
    `;
    const params = [id];

    if (date_from) {
      query += ' AND transaction_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND transaction_date <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY transaction_date DESC, created_at DESC';

    const [statement] = await db.query(query, params);

    return successResponse(res, 200, 'Customer statement retrieved successfully', statement);

  } catch (error) {
    console.error('Get customer statement error:', error);
    return errorResponse(res, 500, 'Error retrieving customer statement', error);
  }
};

/**
 * @desc    Get customer groups
 * @route   GET /api/v1/customers/groups
 * @access  Private
 */
exports.getCustomerGroups = async (req, res) => {
  try {
    const [groups] = await db.query(`
      SELECT cg.*, COUNT(c.id) as customer_count
      FROM customer_groups cg
      LEFT JOIN customers c ON cg.id = c.customer_group_id AND c.active = TRUE
      WHERE cg.active = TRUE
      GROUP BY cg.id
      ORDER BY cg.name
    `);

    return successResponse(res, 200, 'Customer groups retrieved successfully', groups);

  } catch (error) {
    console.error('Get customer groups error:', error);
    return errorResponse(res, 500, 'Error retrieving customer groups', error);
  }
};

module.exports = exports;