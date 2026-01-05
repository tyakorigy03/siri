// src/controllers/purchase.controller.js - Purchase Management Controller
const db = require('../config/database');
const { successResponse, errorResponse, createdResponse, notFoundResponse, paginatedResponse, badRequestResponse } = require('../utils/response');
const { generateId } = require('../utils/generateId');
const { calculateExclusiveVAT } = require('../utils/calculateVAT');

/**
 * @desc    Get all purchase orders
 * @route   GET /api/v1/purchases/orders
 * @access  Private
 */
exports.getPurchaseOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, supplier_id, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        po.*,
        s.name as supplier_name,
        w.name as warehouse_name,
        u1.name as created_by_name,
        u2.name as approved_by_name
      FROM purchase_orders po
      INNER JOIN suppliers s ON po.supplier_id = s.id
      INNER JOIN warehouses w ON po.warehouse_id = w.id
      LEFT JOIN users u1 ON po.created_by = u1.id
      LEFT JOIN users u2 ON po.approved_by = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (supplier_id) {
      query += ' AND po.supplier_id = ?';
      params.push(supplier_id);
    }

    if (status) {
      query += ' AND po.status = ?';
      params.push(status);
    }

    // Get total
    const countQuery = query.replace(
      'SELECT po.*, s.name as supplier_name, w.name as warehouse_name, u1.name as created_by_name, u2.name as approved_by_name',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY po.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await db.query(query, params);

    return paginatedResponse(res, orders, parseInt(page), parseInt(limit), total, 'Purchase orders retrieved successfully');

  } catch (error) {
    console.error('Get purchase orders error:', error);
    return errorResponse(res, 500, 'Error retrieving purchase orders', error);
  }
};

/**
 * @desc    Get single purchase order
 * @route   GET /api/v1/purchases/orders/:id
 * @access  Private
 */
exports.getPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query(`
      SELECT 
        po.*,
        s.name as supplier_name,
        w.name as warehouse_name
      FROM purchase_orders po
      INNER JOIN suppliers s ON po.supplier_id = s.id
      INNER JOIN warehouses w ON po.warehouse_id = w.id
      WHERE po.id = ?
    `, [id]);

    if (orders.length === 0) {
      return notFoundResponse(res, 'Purchase order not found');
    }

    // Get items
    const [items] = await db.query(`
      SELECT 
        poi.*,
        p.name as product_name,
        p.sku
      FROM purchase_order_items poi
      INNER JOIN products p ON poi.product_id = p.id
      WHERE poi.purchase_order_id = ?
    `, [id]);

    return successResponse(res, 200, 'Purchase order retrieved successfully', {
      ...orders[0],
      items
    });

  } catch (error) {
    console.error('Get purchase order error:', error);
    return errorResponse(res, 500, 'Error retrieving purchase order', error);
  }
};

/**
 * @desc    Create purchase order
 * @route   POST /api/v1/purchases/orders
 * @access  Private (storekeeper, manager, owner)
 */
exports.createPurchaseOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      business_id,
      supplier_id,
      warehouse_id,
      order_date,
      expected_date,
      items,
      notes
    } = req.body;

    // Calculate total
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.quantity * item.unit_cost;
    });

    // Generate PO ID and number
    const poId = generateId('PO', Date.now());
    const [lastPO] = await connection.query(
      'SELECT order_number FROM purchase_orders ORDER BY created_at DESC LIMIT 1'
    );
    const lastNumber = lastPO.length > 0 ? parseInt(lastPO[0].order_number.split('-')[2]) : 0;
    const orderNumber = `PO-${new Date().getFullYear()}-${String(lastNumber + 1).padStart(4, '0')}`;

    // Create purchase order
    await connection.query(`
      INSERT INTO purchase_orders (
        id, business_id, supplier_id, warehouse_id, order_number,
        status, order_date, expected_date, total_amount, notes, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?, ?, NOW())
    `, [
      poId,
      business_id,
      supplier_id,
      warehouse_id,
      orderNumber,
      order_date,
      expected_date || null,
      totalAmount,
      notes || null,
      req.user.id
    ]);

    // Add items
    for (const item of items) {
      const lineTotal = item.quantity * item.unit_cost;
      await connection.query(`
        INSERT INTO purchase_order_items (
          purchase_order_id, product_id, variant_id, quantity, unit_cost, line_total
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        poId,
        item.product_id,
        item.variant_id || null,
        item.quantity,
        item.unit_cost,
        lineTotal
      ]);
    }

    await connection.commit();

    const [createdPO] = await connection.query(
      'SELECT * FROM purchase_orders WHERE id = ?',
      [poId]
    );

    return createdResponse(res, 'Purchase order created successfully', createdPO[0]);

  } catch (error) {
    await connection.rollback();
    console.error('Create purchase order error:', error);
    return errorResponse(res, 500, 'Error creating purchase order', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Approve purchase order
 * @route   PUT /api/v1/purchases/orders/:id/approve
 * @access  Private (manager, owner)
 */
exports.approvePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query('SELECT * FROM purchase_orders WHERE id = ?', [id]);
    
    if (orders.length === 0) {
      return notFoundResponse(res, 'Purchase order not found');
    }

    if (orders[0].status !== 'DRAFT' && orders[0].status !== 'PENDING') {
      return badRequestResponse(res, 'Only draft or pending orders can be approved');
    }

    await db.query(
      'UPDATE purchase_orders SET status = "APPROVED", approved_by = ? WHERE id = ?',
      [req.user.id, id]
    );

    return successResponse(res, 200, 'Purchase order approved successfully');

  } catch (error) {
    console.error('Approve purchase order error:', error);
    return errorResponse(res, 500, 'Error approving purchase order', error);
  }
};

/**
 * @desc    Get purchase invoices
 * @route   GET /api/v1/purchases/invoices
 * @access  Private
 */
exports.getPurchaseInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 20, supplier_id, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        pi.*,
        s.name as supplier_name,
        po.order_number
      FROM purchase_invoices pi
      INNER JOIN suppliers s ON pi.supplier_id = s.id
      LEFT JOIN purchase_orders po ON pi.purchase_order_id = po.id
      WHERE 1=1
    `;
    const params = [];

    if (supplier_id) {
      query += ' AND pi.supplier_id = ?';
      params.push(supplier_id);
    }

    if (status) {
      query += ' AND pi.status = ?';
      params.push(status);
    }

    // Get total
    const countQuery = query.replace(
      'SELECT pi.*, s.name as supplier_name, po.order_number',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY pi.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [invoices] = await db.query(query, params);

    return paginatedResponse(res, invoices, parseInt(page), parseInt(limit), total, 'Purchase invoices retrieved successfully');

  } catch (error) {
    console.error('Get purchase invoices error:', error);
    return errorResponse(res, 500, 'Error retrieving purchase invoices', error);
  }
};

/**
 * @desc    Create purchase invoice (receive goods)
 * @route   POST /api/v1/purchases/invoices
 * @access  Private (storekeeper, manager, owner)
 */
exports.createPurchaseInvoice = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      business_id,
      supplier_id,
      purchase_order_id,
      invoice_number,
      invoice_date,
      due_date,
      items,
      withholding_tax_rate,
      notes
    } = req.body;

    // Calculate totals
    let totalExclVAT = 0;
    items.forEach(item => {
      totalExclVAT += item.quantity * item.unit_cost;
    });

    const vatCalc = calculateExclusiveVAT(totalExclVAT, 18);
    const whtAmount = totalExclVAT * (withholding_tax_rate || 0) / 100;
    const netPayable = vatCalc.totalInclVAT - whtAmount;

    // Generate invoice ID
    const invoiceId = generateId('PI', Date.now());

    // Create purchase invoice
    await connection.query(`
      INSERT INTO purchase_invoices (
        id, business_id, supplier_id, purchase_order_id, invoice_number,
        invoice_date, due_date, total_excl_vat, vat_amount,
        withholding_tax_rate, withholding_tax_amount, total_incl_vat,
        net_payable, amount_remaining, status, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNPAID', ?, NOW())
    `, [
      invoiceId,
      business_id,
      supplier_id,
      purchase_order_id || null,
      invoice_number,
      invoice_date,
      due_date || null,
      vatCalc.totalExclVAT,
      vatCalc.vatAmount,
      withholding_tax_rate || 0,
      whtAmount,
      vatCalc.totalInclVAT,
      netPayable,
      netPayable,
      req.user.id
    ]);

    // Get warehouse from PO if provided
    let warehouseId = null;
    if (purchase_order_id) {
      const [po] = await connection.query(
        'SELECT warehouse_id FROM purchase_orders WHERE id = ?',
        [purchase_order_id]
      );
      warehouseId = po[0]?.warehouse_id;
    }

    // Add items and update inventory
    for (const item of items) {
      const lineTotal = item.quantity * item.unit_cost;

      // Insert invoice item
      await connection.query(`
        INSERT INTO purchase_invoice_items (
          purchase_invoice_id, product_id, variant_id, batch_number,
          quantity, unit_cost, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        invoiceId,
        item.product_id,
        item.variant_id || null,
        item.batch_number || null,
        item.quantity,
        item.unit_cost,
        lineTotal
      ]);

      // Update inventory if warehouse is known
      if (warehouseId) {
        // Check if stock record exists
        const [existingStock] = await connection.query(
          'SELECT * FROM inventory_stock WHERE product_id = ? AND warehouse_id = ?',
          [item.product_id, warehouseId]
        );

        if (existingStock.length > 0) {
          await connection.query(
            'UPDATE inventory_stock SET quantity = quantity + ? WHERE product_id = ? AND warehouse_id = ?',
            [item.quantity, item.product_id, warehouseId]
          );
        } else {
          await connection.query(
            'INSERT INTO inventory_stock (product_id, warehouse_id, quantity) VALUES (?, ?, ?)',
            [item.product_id, warehouseId, item.quantity]
          );
        }

        // Create inventory movement
        const movementId = generateId('INV', Date.now());
        await connection.query(`
          INSERT INTO inventory_movements (
            id, product_id, variant_id, warehouse_id, movement_type,
            quantity_in, quantity_out, reference_type, reference_id,
            cost_price, notes, created_by, created_at
          ) VALUES (?, ?, ?, ?, 'PURCHASE', ?, 0, 'PURCHASE_INVOICE', ?, ?, 'Purchase received', ?, NOW())
        `, [
          movementId,
          item.product_id,
          item.variant_id || null,
          warehouseId,
          item.quantity,
          invoiceId,
          item.unit_cost,
          req.user.id
        ]);
      }
    }

    // Create VAT entry
    const vatId = generateId('VAT', Date.now());
    const currentPeriod = new Date().toISOString().slice(0, 7);
    await connection.query(`
      INSERT INTO vat_entries (
        id, business_id, entry_type, source_type, source_id,
        transaction_date, taxable_amount, vat_amount, vat_rate, period
      ) VALUES (?, ?, 'INPUT', 'PURCHASE', ?, ?, ?, ?, 18.00, ?)
    `, [
      vatId,
      business_id,
      invoiceId,
      invoice_date,
      vatCalc.totalExclVAT,
      vatCalc.vatAmount,
      currentPeriod
    ]);

    // Update PO status if linked
    if (purchase_order_id) {
      await connection.query(
        'UPDATE purchase_orders SET status = "RECEIVED" WHERE id = ?',
        [purchase_order_id]
      );
    }

    await connection.commit();

    const [createdInvoice] = await connection.query(
      'SELECT * FROM purchase_invoices WHERE id = ?',
      [invoiceId]
    );

    return createdResponse(res, 'Purchase invoice created successfully', createdInvoice[0]);

  } catch (error) {
    await connection.rollback();
    console.error('Create purchase invoice error:', error);
    return errorResponse(res, 500, 'Error creating purchase invoice', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Pay supplier (record payment)
 * @route   POST /api/v1/purchases/invoices/:id/pay
 * @access  Private (accountant, manager, owner)
 */
exports.paySupplier = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { amount, payment_method, reference_number, notes } = req.body;

    // Get invoice
    const [invoices] = await connection.query(
      'SELECT * FROM purchase_invoices WHERE id = ?',
      [id]
    );

    if (invoices.length === 0) {
      await connection.rollback();
      return notFoundResponse(res, 'Purchase invoice not found');
    }

    const invoice = invoices[0];
    const newAmountPaid = parseFloat(invoice.amount_paid) + parseFloat(amount);
    const remaining = parseFloat(invoice.net_payable) - newAmountPaid;

    let newStatus = 'PARTIAL';
    if (remaining <= 0) {
      newStatus = 'PAID';
    }

    // Create supplier payment
    const paymentId = generateId('SP', Date.now());
    await connection.query(`
      INSERT INTO supplier_payments (
        id, business_id, supplier_id, purchase_invoice_id,
        payment_date, amount, payment_method, reference_number,
        notes, created_by, created_at
      ) VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, NOW())
    `, [
      paymentId,
      invoice.business_id,
      invoice.supplier_id,
      id,
      amount,
      payment_method,
      reference_number || null,
      notes || null,
      req.user.id
    ]);

    // Update invoice
    await connection.query(`
      UPDATE purchase_invoices 
      SET amount_paid = ?, amount_remaining = ?, status = ?
      WHERE id = ?
    `, [newAmountPaid, Math.max(0, remaining), newStatus, id]);

    await connection.commit();

    return successResponse(res, 200, 'Payment recorded successfully', {
      payment_id: paymentId,
      amount_paid: newAmountPaid,
      remaining: Math.max(0, remaining),
      status: newStatus
    });

  } catch (error) {
    await connection.rollback();
    console.error('Pay supplier error:', error);
    return errorResponse(res, 500, 'Error recording payment', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Get accounts payable summary
 * @route   GET /api/v1/purchases/payables
 * @access  Private
 */
exports.getAccountsPayable = async (req, res) => {
  try {
    const [summary] = await db.query(`
      SELECT 
        s.id as supplier_id,
        s.name as supplier_name,
        COUNT(pi.id) as invoice_count,
        SUM(pi.net_payable) as total_payable,
        SUM(pi.amount_paid) as total_paid,
        SUM(pi.amount_remaining) as total_outstanding,
        MIN(pi.due_date) as earliest_due_date
      FROM suppliers s
      LEFT JOIN purchase_invoices pi ON s.id = pi.supplier_id 
        AND pi.status IN ('UNPAID', 'PARTIAL')
      GROUP BY s.id, s.name
      HAVING total_outstanding > 0
      ORDER BY total_outstanding DESC
    `);

    return successResponse(res, 200, 'Accounts payable retrieved successfully', summary);

  } catch (error) {
    console.error('Get accounts payable error:', error);
    return errorResponse(res, 500, 'Error retrieving accounts payable', error);
  }
};

module.exports = exports;