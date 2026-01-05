// src/controllers/invoice.controller.js - Customer Invoice Management
const db = require('../config/database');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/response');

/**
 * @desc    Get invoice for a sale
 * @route   GET /api/v1/invoices/:saleId
 * @access  Private
 */
exports.getInvoice = async (req, res) => {
  try {
    const { saleId } = req.params;

    // Get sale with all details
    const [sales] = await db.query(`
      SELECT 
        s.*,
        b.name as branch_name,
        b.address as branch_address,
        b.phone as branch_phone,
        b.email as branch_email,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.address as customer_address,
        c.tin as customer_tin,
        bus.name as business_name,
        bus.tin as business_tin,
        bus.phone as business_phone,
        bus.email as business_email,
        bus.address as business_address,
        bus.logo_url
      FROM sales s
      INNER JOIN branches b ON s.branch_id = b.id
      INNER JOIN business bus ON s.business_id = bus.id
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `, [saleId]);

    if (sales.length === 0) {
      return notFoundResponse(res, 'Sale not found');
    }

    // Get sale items
    const [items] = await db.query(`
      SELECT 
        si.*,
        p.name as product_name,
        p.sku,
        pv.variant_name
      FROM sale_items si
      INNER JOIN products p ON si.product_id = p.id
      LEFT JOIN product_variants pv ON si.variant_id = pv.id
      WHERE si.sale_id = ?
    `, [saleId]);

    // Get payments
    const [payments] = await db.query(`
      SELECT 
        p.*,
        u.name as received_by_name
      FROM payments p
      LEFT JOIN users u ON p.received_by = u.id
      WHERE p.sale_id = ?
      ORDER BY p.received_at
    `, [saleId]);

    const invoice = {
      ...sales[0],
      items,
      payments,
      invoice_number: sales[0].sale_number,
      invoice_date: sales[0].sale_date
    };

    return successResponse(res, 200, 'Invoice retrieved successfully', invoice);

  } catch (error) {
    console.error('Get invoice error:', error);
    return errorResponse(res, 500, 'Error retrieving invoice', error);
  }
};

/**
 * @desc    Get invoice PDF data (for generating PDF on frontend)
 * @route   GET /api/v1/invoices/:saleId/pdf-data
 * @access  Private
 */
exports.getInvoicePDFData = async (req, res) => {
  try {
    const { saleId } = req.params;

    // Get complete invoice data
    const [sales] = await db.query(`
      SELECT 
        s.*,
        b.name as branch_name,
        b.address as branch_address,
        b.phone as branch_phone,
        b.email as branch_email,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.address as customer_address,
        c.tin as customer_tin,
        bus.name as business_name,
        bus.tin as business_tin,
        bus.phone as business_phone,
        bus.email as business_email,
        bus.address as business_address,
        bus.logo_url,
        u.name as served_by_name
      FROM sales s
      INNER JOIN branches b ON s.branch_id = b.id
      INNER JOIN business bus ON s.business_id = bus.id
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.served_by = u.id
      WHERE s.id = ?
    `, [saleId]);

    if (sales.length === 0) {
      return notFoundResponse(res, 'Sale not found');
    }

    const [items] = await db.query(`
      SELECT 
        si.*,
        p.name as product_name,
        p.sku
      FROM sale_items si
      INNER JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `, [saleId]);

    const [payments] = await db.query(`
      SELECT * FROM payments WHERE sale_id = ? ORDER BY received_at
    `, [saleId]);

    // Format data for PDF generation
    const pdfData = {
      invoice_number: sales[0].sale_number,
      invoice_date: sales[0].sale_date,
      due_date: sales[0].created_at, // or calculate based on credit terms
      
      // Business details
      from: {
        business_name: sales[0].business_name,
        tin: sales[0].business_tin,
        address: sales[0].business_address,
        phone: sales[0].business_phone,
        email: sales[0].business_email,
        logo: sales[0].logo_url,
        branch: sales[0].branch_name,
        branch_address: sales[0].branch_address
      },

      // Customer details
      to: {
        name: sales[0].customer_name || 'Walk-in Customer',
        tin: sales[0].customer_tin,
        address: sales[0].customer_address,
        phone: sales[0].customer_phone,
        email: sales[0].customer_email
      },

      // Line items
      items: items.map(item => ({
        description: item.product_name,
        sku: item.sku,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
        discount: parseFloat(item.discount),
        total: parseFloat(item.line_total)
      })),

      // Totals
      subtotal: parseFloat(sales[0].total_excl_vat),
      vat_rate: 18,
      vat_amount: parseFloat(sales[0].vat_amount),
      discount: parseFloat(sales[0].discount_amount),
      total: parseFloat(sales[0].grand_total),
      amount_paid: parseFloat(sales[0].amount_paid),
      balance_due: parseFloat(sales[0].grand_total) - parseFloat(sales[0].amount_paid),

      // Payment details
      payments: payments.map(p => ({
        date: p.payment_date,
        method: p.method,
        amount: parseFloat(p.amount),
        reference: p.reference_number
      })),

      // Additional info
      payment_status: sales[0].payment_status,
      served_by: sales[0].served_by_name,
      notes: sales[0].notes,
      
      // Footer info
      terms_and_conditions: 'Payment is due within 30 days. Thank you for your business.',
      bank_details: 'Bank: XYZ Bank | Account: 1234567890 | Branch: Main Branch'
    };

    return successResponse(res, 200, 'Invoice PDF data retrieved successfully', pdfData);

  } catch (error) {
    console.error('Get invoice PDF data error:', error);
    return errorResponse(res, 500, 'Error retrieving invoice PDF data', error);
  }
};

/**
 * @desc    Get all invoices (sales with invoice view)
 * @route   GET /api/v1/invoices
 * @access  Private
 */
exports.getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 20, customer_id, status, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        s.id,
        s.sale_number as invoice_number,
        s.sale_date as invoice_date,
        s.grand_total,
        s.amount_paid,
        s.payment_status,
        c.name as customer_name,
        b.name as branch_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      INNER JOIN branches b ON s.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (customer_id) {
      query += ' AND s.customer_id = ?';
      params.push(customer_id);
    }

    if (status) {
      query += ' AND s.payment_status = ?';
      params.push(status);
    }

    if (date_from) {
      query += ' AND s.sale_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND s.sale_date <= ?';
      params.push(date_to);
    }

    // Get total
    const countQuery = query.replace(
      'SELECT s.id, s.sale_number as invoice_number, s.sale_date as invoice_date, s.grand_total, s.amount_paid, s.payment_status, c.name as customer_name, b.name as branch_name',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY s.sale_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [invoices] = await db.query(query, params);

    return successResponse(res, 200, 'Invoices retrieved successfully', {
      data: invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all invoices error:', error);
    return errorResponse(res, 500, 'Error retrieving invoices', error);
  }
};

/**
 * @desc    Send invoice reminder
 * @route   POST /api/v1/invoices/:saleId/reminder
 * @access  Private (accountant, manager, owner)
 */
exports.sendInvoiceReminder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { saleId } = req.params;

    // Get sale and customer
    const [sales] = await connection.query(`
      SELECT s.*, c.name as customer_name, c.email, c.phone
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `, [saleId]);

    if (sales.length === 0) {
      await connection.rollback();
      return notFoundResponse(res, 'Sale/Invoice not found');
    }

    const sale = sales[0];

    if (sale.payment_status === 'PAID') {
      await connection.rollback();
      return errorResponse(res, 400, 'Invoice is already paid');
    }

    // Update receivable reminder
    await connection.query(`
      UPDATE receivables 
      SET reminder_sent = TRUE, 
          reminder_count = reminder_count + 1,
          last_reminder_date = CURDATE()
      WHERE sale_id = ?
    `, [saleId]);

    // In a real system, you would send email/SMS here
    // For now, just log the action
    console.log(`Invoice reminder sent for sale ${saleId} to customer ${sale.customer_name}`);

    await connection.commit();

    return successResponse(res, 200, 'Invoice reminder sent successfully', {
      sale_id: saleId,
      customer: sale.customer_name,
      amount_due: parseFloat(sale.grand_total) - parseFloat(sale.amount_paid)
    });

  } catch (error) {
    await connection.rollback();
    console.error('Send invoice reminder error:', error);
    return errorResponse(res, 500, 'Error sending invoice reminder', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Get overdue invoices
 * @route   GET /api/v1/invoices/overdue
 * @access  Private
 */
exports.getOverdueInvoices = async (req, res) => {
  try {
    const [overdue] = await db.query(`
      SELECT 
        r.id as receivable_id,
        s.id as sale_id,
        s.sale_number as invoice_number,
        s.sale_date as invoice_date,
        r.due_date,
        DATEDIFF(CURDATE(), r.due_date) as days_overdue,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        r.amount_due - r.amount_paid as amount_overdue,
        r.reminder_count,
        r.last_reminder_date
      FROM receivables r
      INNER JOIN sales s ON r.sale_id = s.id
      INNER JOIN customers c ON r.customer_id = c.id
      WHERE r.status IN ('OPEN', 'PARTIAL', 'OVERDUE')
        AND r.due_date < CURDATE()
      ORDER BY r.due_date ASC
    `);

    return successResponse(res, 200, 'Overdue invoices retrieved successfully', overdue);

  } catch (error) {
    console.error('Get overdue invoices error:', error);
    return errorResponse(res, 500, 'Error retrieving overdue invoices', error);
  }
};

module.exports = exports;