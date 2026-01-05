
// src/controllers/sales.controller.js - Sales Controller
const db = require('../config/database');
const { successResponse, errorResponse, createdResponse, notFoundResponse, paginatedResponse, badRequestResponse } = require('../utils/response');
const { generateId, generateSaleNumber } = require('../utils/generateId');
const { calculateSaleTotals } = require('../utils/calculateVAT');

/**
 * @desc    Get all sales
 * @route   GET /api/v1/sales
 * @access  Private
 */
exports.getSales = async (req, res) => {
  try {
    const { page = 1, limit = 20, branch_id, date_from, date_to, payment_status, channel } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, 
        c.name as customer_name,
        b.name as branch_name,
        u.name as served_by_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      INNER JOIN branches b ON s.branch_id = b.id
      LEFT JOIN users u ON s.served_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Add filters
    if (branch_id) {
      query += ' AND s.branch_id = ?';
      params.push(branch_id);
    }

    if (date_from) {
      query += ' AND s.sale_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND s.sale_date <= ?';
      params.push(date_to);
    }

    if (payment_status) {
      query += ' AND s.payment_status = ?';
      params.push(payment_status);
    }

    if (channel) {
      query += ' AND s.channel = ?';
      params.push(channel);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT s.*, c.name as customer_name, b.name as branch_name, u.name as served_by_name',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Add pagination and ordering
    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [sales] = await db.query(query, params);

    return paginatedResponse(res, sales, parseInt(page), parseInt(limit), total, 'Sales retrieved successfully');

  } catch (error) {
    console.error('Get sales error:', error);
    return errorResponse(res, 500, 'Error retrieving sales', error);
  }
};

/**
 * @desc    Get single sale
 * @route   GET /api/v1/sales/:id
 * @access  Private
 */
exports.getSale = async (req, res) => {
  try {
    const { id } = req.params;

    const [sales] = await db.query(`
      SELECT s.*,
        c.name as customer_name, c.phone as customer_phone,
        b.name as branch_name,
        u.name as served_by_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      INNER JOIN branches b ON s.branch_id = b.id
      LEFT JOIN users u ON s.served_by = u.id
      WHERE s.id = ?
    `, [id]);

    if (sales.length === 0) {
      return notFoundResponse(res, 'Sale not found');
    }

    // Get sale items
    const [items] = await db.query(`
      SELECT si.*, p.name as product_name, p.sku
      FROM sale_items si
      INNER JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `, [id]);

    // Get payments
    const [payments] = await db.query(`
      SELECT p.*, u.name as received_by_name
      FROM payments p
      LEFT JOIN users u ON p.received_by = u.id
      WHERE p.sale_id = ?
    `, [id]);

    const saleData = {
      ...sales[0],
      items,
      payments
    };

    return successResponse(res, 200, 'Sale retrieved successfully', saleData);

  } catch (error) {
    console.error('Get sale error:', error);
    return errorResponse(res, 500, 'Error retrieving sale', error);
  }
};

/**
 * @desc    Create sale
 * @route   POST /api/v1/sales
 * @access  Private (cashier, receptionist, manager, owner)
 */
exports.createSale = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      business_id,
      branch_id,
      warehouse_id,
      channel,
      customer_id,
      items,
      payment_method,
      payment_amount,
      discount_amount = 0,
      notes
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      await connection.rollback();
      return badRequestResponse(res, 'At least one item is required');
    }

    // Get business pricing mode and VAT rate
    const [business] = await connection.query(
      'SELECT pricing_mode, default_vat_rate FROM business WHERE id = ?',
      [business_id]
    );

    if (business.length === 0) {
      await connection.rollback();
      return badRequestResponse(res, 'Business not found');
    }

    const pricingMode = business[0].pricing_mode;
    const vatRate = business[0].default_vat_rate;

    // Calculate totals
    const totals = calculateSaleTotals(items, pricingMode, vatRate, discount_amount);

    // Generate sale ID and number
    const saleId = generateId('SAL', Date.now());
    const [lastSale] = await connection.query(
      'SELECT sale_number FROM sales WHERE YEAR(sale_date) = YEAR(CURDATE()) ORDER BY created_at DESC LIMIT 1'
    );
    const lastNumber = lastSale.length > 0 ? parseInt(lastSale[0].sale_number.split('-')[2]) : 0;
    const saleNumber = generateSaleNumber(lastNumber + 1);

    // Determine payment status
    let paymentStatus = 'UNPAID';
    let amountPaid = 0;

    if (payment_amount) {
      amountPaid = payment_amount;
      if (payment_amount >= totals.grandTotal) {
        paymentStatus = 'PAID';
      } else if (payment_amount > 0) {
        paymentStatus = 'PARTIAL';
      }
    }

    if (payment_method === 'CREDIT') {
      paymentStatus = 'CREDIT';
    }

    // Insert sale
    await connection.query(`
      INSERT INTO sales (
        id, business_id, branch_id, warehouse_id, channel, customer_id,
        sale_number, sale_date, total_excl_vat, vat_amount, total_incl_vat,
        discount_amount, grand_total, amount_paid, payment_status, currency,
        notes, served_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, 'RWF', ?, ?, NOW())
    `, [
      saleId, business_id, branch_id, warehouse_id, channel, customer_id || null,
      saleNumber, totals.totalExclVAT, totals.vatAmount, totals.totalInclVAT,
      discount_amount, totals.grandTotal, amountPaid, paymentStatus,
      notes || null, req.user.id
    ]);

    // Insert sale items and update inventory
    for (const item of items) {
      const lineTotal = (item.unit_price * item.quantity) - (item.discount || 0);

      // Insert sale item
      await connection.query(`
        INSERT INTO sale_items (
          sale_id, product_id, variant_id, quantity, unit_price, discount, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        saleId, item.product_id, item.variant_id || null,
        item.quantity, item.unit_price, item.discount || 0, lineTotal
      ]);

      // Update inventory stock
      await connection.query(`
        UPDATE inventory_stock 
        SET quantity = quantity - ?
        WHERE product_id = ? AND warehouse_id = ?
      `, [item.quantity, item.product_id, warehouse_id]);

      // Create inventory movement
      const movementId = generateId('INV', Date.now());
      await connection.query(`
        INSERT INTO inventory_movements (
          id, product_id, variant_id, warehouse_id, movement_type,
          quantity_in, quantity_out, reference_type, reference_id,
          notes, created_by, created_at
        ) VALUES (?, ?, ?, ?, 'SALE', 0, ?, 'SALE', ?, 'Sale transaction', ?, NOW())
      `, [
        movementId, item.product_id, item.variant_id || null, warehouse_id,
        item.quantity, saleId, req.user.id
      ]);
    }

    // Insert payment if provided
    if (payment_method && payment_amount > 0) {
      const paymentId = generateId('PAY', Date.now());
      await connection.query(`
        INSERT INTO payments (
          id, business_id, sale_id, payment_date, method, amount,
          currency, received_by, received_at
        ) VALUES (?, ?, ?, CURDATE(), ?, ?, 'RWF', ?, NOW())
      `, [paymentId, business_id, saleId, payment_method, payment_amount, req.user.id]);
    }

    // Create VAT entry
    const vatId = generateId('VAT', Date.now());
    const currentPeriod = new Date().toISOString().slice(0, 7);
    await connection.query(`
      INSERT INTO vat_entries (
        id, business_id, entry_type, source_type, source_id,
        transaction_date, taxable_amount, vat_amount, vat_rate, period
      ) VALUES (?, ?, 'OUTPUT', 'SALE', ?, CURDATE(), ?, ?, ?, ?)
    `, [vatId, business_id, saleId, totals.totalExclVAT, totals.vatAmount, vatRate, currentPeriod]);

    // If credit sale, create receivable
    if (paymentStatus === 'CREDIT' || paymentStatus === 'PARTIAL') {
      const receivableId = generateId('REC', Date.now());
      const amountDue = totals.grandTotal - amountPaid;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // Default 30 days

      await connection.query(`
        INSERT INTO receivables (
          id, business_id, customer_id, sale_id, amount_due,
          amount_paid, due_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN')
      `, [receivableId, business_id, customer_id, saleId, amountDue, amountPaid, dueDate.toISOString().slice(0, 10)]);
    }

    await connection.commit();

    // Fetch created sale
    const [createdSale] = await connection.query('SELECT * FROM sales WHERE id = ?', [saleId]);

    return createdResponse(res, 'Sale created successfully', createdSale[0]);

  } catch (error) {
    await connection.rollback();
    console.error('Create sale error:', error);
    return errorResponse(res, 500, 'Error creating sale', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Add payment to sale
 * @route   POST /api/v1/sales/:id/payment
 * @access  Private
 */
exports.addPayment = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { payment_method, amount } = req.body;

    // Get sale
    const [sales] = await connection.query(
      'SELECT * FROM sales WHERE id = ?',
      [id]
    );

    if (sales.length === 0) {
      await connection.rollback();
      return notFoundResponse(res, 'Sale not found');
    }

    const sale = sales[0];
    const newAmountPaid = parseFloat(sale.amount_paid) + parseFloat(amount);
    const remaining = parseFloat(sale.grand_total) - newAmountPaid;

    // Determine new payment status
    let newStatus = 'PARTIAL';
    if (remaining <= 0) {
      newStatus = 'PAID';
    }

    // Insert payment
    const paymentId = generateId('PAY', Date.now());
    await connection.query(`
      INSERT INTO payments (
        id, business_id, sale_id, payment_date, method, amount,
        currency, received_by, received_at
      ) VALUES (?, ?, ?, CURDATE(), ?, ?, 'RWF', ?, NOW())
    `, [paymentId, sale.business_id, id, payment_method, amount, req.user.id]);

    // Update sale
    await connection.query(`
      UPDATE sales 
      SET amount_paid = ?, payment_status = ?
      WHERE id = ?
    `, [newAmountPaid, newStatus, id]);

    // Update receivable if exists
    await connection.query(`
      UPDATE receivables
      SET amount_paid = amount_paid + ?, status = ?
      WHERE sale_id = ?
    `, [amount, newStatus === 'PAID' ? 'PAID' : 'PARTIAL', id]);

    await connection.commit();

    return successResponse(res, 200, 'Payment added successfully', {
      payment_id: paymentId,
      new_amount_paid: newAmountPaid,
      remaining: Math.max(0, remaining),
      payment_status: newStatus
    });

  } catch (error) {
    await connection.rollback();
    console.error('Add payment error:', error);
    return errorResponse(res, 500, 'Error adding payment', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Get sales summary
 * @route   GET /api/v1/sales/summary
 * @access  Private
 */
exports.getSalesSummary = async (req, res) => {
  try {
    const { date_from, date_to, branch_id } = req.query;

    let query = `
      SELECT 
        COUNT(*) as total_sales,
        SUM(grand_total) as total_revenue,
        SUM(vat_amount) as total_vat,
        AVG(grand_total) as average_sale,
        SUM(CASE WHEN payment_status = 'PAID' THEN grand_total ELSE 0 END) as paid_amount,
        SUM(CASE WHEN payment_status = 'CREDIT' THEN grand_total ELSE 0 END) as credit_amount
      FROM sales
      WHERE 1=1
    `;
    const params = [];

    if (date_from) {
      query += ' AND sale_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND sale_date <= ?';
      params.push(date_to);
    }

    if (branch_id) {
      query += ' AND branch_id = ?';
      params.push(branch_id);
    }

    const [summary] = await db.query(query, params);

    return successResponse(res, 200, 'Sales summary retrieved successfully', summary[0]);

  } catch (error) {
    console.error('Get sales summary error:', error);
    return errorResponse(res, 500, 'Error retrieving sales summary', error);
  }
};

module.exports = exports;