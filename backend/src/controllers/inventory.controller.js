// src/controllers/inventory.controller.js - Inventory Controller
const db = require('../config/database');
const { successResponse, errorResponse, createdResponse, notFoundResponse, paginatedResponse, badRequestResponse } = require('../utils/response');
const { generateId } = require('../utils/generateId');

/**
 * @desc    Get stock levels
 * @route   GET /api/v1/inventory/stock
 * @access  Private
 */
exports.getStockLevels = async (req, res) => {
  try {
    const { page = 1, limit = 20, warehouse_id, low_stock, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        ist.id,
        ist.product_id,
        ist.warehouse_id,
        ist.quantity,
        ist.reserved_quantity,
        ist.last_updated,
        p.name as product_name,
        p.sku,
        p.category,
        p.min_stock_level,
        p.reorder_point,
        w.name as warehouse_name,
        b.name as branch_name,
        CASE 
          WHEN ist.quantity <= p.reorder_point THEN 'LOW'
          WHEN ist.quantity <= p.min_stock_level THEN 'CRITICAL'
          ELSE 'NORMAL'
        END as stock_status
      FROM inventory_stock ist
      INNER JOIN products p ON ist.product_id = p.id
      INNER JOIN warehouses w ON ist.warehouse_id = w.id
      INNER JOIN branches b ON w.branch_id = b.id
      WHERE p.active = TRUE
    `;
    const params = [];

    // Add filters
    if (warehouse_id) {
      query += ' AND ist.warehouse_id = ?';
      params.push(warehouse_id);
    }

    if (low_stock === 'true') {
      query += ' AND ist.quantity <= p.reorder_point';
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT ist.id, ist.product_id, ist.warehouse_id, ist.quantity, ist.reserved_quantity, ist.last_updated, p.name as product_name, p.sku, p.category, p.min_stock_level, p.reorder_point, w.name as warehouse_name, b.name as branch_name, CASE WHEN ist.quantity <= p.reorder_point THEN \'LOW\' WHEN ist.quantity <= p.min_stock_level THEN \'CRITICAL\' ELSE \'NORMAL\' END as stock_status',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Add pagination
    query += ' ORDER BY ist.quantity ASC, p.name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [stock] = await db.query(query, params);

    return paginatedResponse(res, stock, parseInt(page), parseInt(limit), total, 'Stock levels retrieved successfully');

  } catch (error) {
    console.error('Get stock levels error:', error);
    return errorResponse(res, 500, 'Error retrieving stock levels', error);
  }
};

/**
 * @desc    Get stock movements
 * @route   GET /api/v1/inventory/movements
 * @access  Private
 */
exports.getStockMovements = async (req, res) => {
  try {
    const { page = 1, limit = 20, product_id, warehouse_id, movement_type, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        im.*,
        p.name as product_name,
        p.sku,
        w.name as warehouse_name,
        b.name as branch_name,
        u.name as created_by_name
      FROM inventory_movements im
      INNER JOIN products p ON im.product_id = p.id
      INNER JOIN warehouses w ON im.warehouse_id = w.id
      INNER JOIN branches b ON w.branch_id = b.id
      LEFT JOIN users u ON im.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Add filters
    if (product_id) {
      query += ' AND im.product_id = ?';
      params.push(product_id);
    }

    if (warehouse_id) {
      query += ' AND im.warehouse_id = ?';
      params.push(warehouse_id);
    }

    if (movement_type) {
      query += ' AND im.movement_type = ?';
      params.push(movement_type);
    }

    if (date_from) {
      query += ' AND DATE(im.created_at) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND DATE(im.created_at) <= ?';
      params.push(date_to);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT im.*, p.name as product_name, p.sku, w.name as warehouse_name, b.name as branch_name, u.name as created_by_name',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Add pagination
    query += ' ORDER BY im.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [movements] = await db.query(query, params);

    return paginatedResponse(res, movements, parseInt(page), parseInt(limit), total, 'Stock movements retrieved successfully');

  } catch (error) {
    console.error('Get stock movements error:', error);
    return errorResponse(res, 500, 'Error retrieving stock movements', error);
  }
};

/**
 * @desc    Create stock adjustment
 * @route   POST /api/v1/inventory/adjustment
 * @access  Private (storekeeper, manager, owner)
 */
exports.createStockAdjustment = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { product_id, warehouse_id, quantity, type, reason, notes } = req.body;

    // Validate type
    if (!['in', 'out'].includes(type)) {
      await connection.rollback();
      return badRequestResponse(res, 'Type must be "in" or "out"');
    }

    // Check if product and warehouse exist
    const [products] = await connection.query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (products.length === 0) {
      await connection.rollback();
      return notFoundResponse(res, 'Product not found');
    }

    const [warehouses] = await connection.query('SELECT * FROM warehouses WHERE id = ?', [warehouse_id]);
    if (warehouses.length === 0) {
      await connection.rollback();
      return notFoundResponse(res, 'Warehouse not found');
    }

    // Check current stock for 'out' adjustments
    if (type === 'out') {
      const [currentStock] = await connection.query(
        'SELECT quantity FROM inventory_stock WHERE product_id = ? AND warehouse_id = ?',
        [product_id, warehouse_id]
      );

      if (currentStock.length === 0 || currentStock[0].quantity < quantity) {
        await connection.rollback();
        return badRequestResponse(res, 'Insufficient stock for this adjustment');
      }
    }

    // Update or insert stock
    const [existingStock] = await connection.query(
      'SELECT * FROM inventory_stock WHERE product_id = ? AND warehouse_id = ?',
      [product_id, warehouse_id]
    );

    if (existingStock.length > 0) {
      const adjustment = type === 'in' ? quantity : -quantity;
      await connection.query(
        'UPDATE inventory_stock SET quantity = quantity + ? WHERE product_id = ? AND warehouse_id = ?',
        [adjustment, product_id, warehouse_id]
      );
    } else {
      if (type === 'in') {
        await connection.query(
          'INSERT INTO inventory_stock (product_id, warehouse_id, quantity) VALUES (?, ?, ?)',
          [product_id, warehouse_id, quantity]
        );
      }
    }

    // Create inventory movement
    const movementId = generateId('INV', Date.now());
    await connection.query(`
      INSERT INTO inventory_movements (
        id, product_id, warehouse_id, movement_type,
        quantity_in, quantity_out, reference_type, reference_id,
        notes, created_by, created_at
      ) VALUES (?, ?, ?, 'ADJUSTMENT', ?, ?, 'ADJUSTMENT', ?, ?, ?, NOW())
    `, [
      movementId,
      product_id,
      warehouse_id,
      type === 'in' ? quantity : 0,
      type === 'out' ? quantity : 0,
      reason,
      notes || null,
      req.user.id
    ]);

    await connection.commit();

    return createdResponse(res, 'Stock adjustment created successfully', {
      movement_id: movementId,
      product_id,
      warehouse_id,
      quantity,
      type
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create stock adjustment error:', error);
    return errorResponse(res, 500, 'Error creating stock adjustment', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Create stock transfer
 * @route   POST /api/v1/inventory/transfer
 * @access  Private (storekeeper, manager, owner)
 */
exports.createStockTransfer = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      from_warehouse_id,
      to_warehouse_id,
      items,
      notes
    } = req.body;

    // Validate warehouses
    if (from_warehouse_id === to_warehouse_id) {
      await connection.rollback();
      return badRequestResponse(res, 'Source and destination warehouses must be different');
    }

    // Check warehouses exist
    const [warehouses] = await connection.query(
      'SELECT * FROM warehouses WHERE id IN (?, ?)',
      [from_warehouse_id, to_warehouse_id]
    );

    if (warehouses.length !== 2) {
      await connection.rollback();
      return badRequestResponse(res, 'Invalid warehouse IDs');
    }

    // Create transfer
    const transferId = generateId('TRF', Date.now());
    await connection.query(`
      INSERT INTO stock_transfers (
        id, from_warehouse_id, to_warehouse_id, status,
        requested_by, transfer_date, notes, created_at
      ) VALUES (?, ?, ?, 'PENDING', ?, CURDATE(), ?, NOW())
    `, [transferId, from_warehouse_id, to_warehouse_id, req.user.id, notes || null]);

    // Add transfer items
    for (const item of items) {
      // Check stock availability
      const [stock] = await connection.query(
        'SELECT quantity FROM inventory_stock WHERE product_id = ? AND warehouse_id = ?',
        [item.product_id, from_warehouse_id]
      );

      if (stock.length === 0 || stock[0].quantity < item.quantity) {
        await connection.rollback();
        return badRequestResponse(res, `Insufficient stock for product ID ${item.product_id}`);
      }

      // Insert transfer item
      await connection.query(`
        INSERT INTO stock_transfer_items (
          transfer_id, product_id, variant_id, quantity_requested
        ) VALUES (?, ?, ?, ?)
      `, [transferId, item.product_id, item.variant_id || null, item.quantity]);
    }

    await connection.commit();

    return createdResponse(res, 'Stock transfer created successfully', {
      transfer_id: transferId,
      status: 'PENDING'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create stock transfer error:', error);
    return errorResponse(res, 500, 'Error creating stock transfer', error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Get inventory valuation
 * @route   GET /api/v1/inventory/valuation
 * @access  Private
 */
exports.getInventoryValuation = async (req, res) => {
  try {
    const { warehouse_id } = req.query;

    let query = `
      SELECT 
        ist.warehouse_id,
        w.name as warehouse_name,
        SUM(ist.quantity * p.cost_price) as total_cost_value,
        SUM(ist.quantity * p.sale_price) as total_retail_value,
        SUM(ist.quantity) as total_units,
        COUNT(DISTINCT ist.product_id) as unique_products
      FROM inventory_stock ist
      INNER JOIN products p ON ist.product_id = p.id
      INNER JOIN warehouses w ON ist.warehouse_id = w.id
      WHERE p.active = TRUE
    `;
    const params = [];

    if (warehouse_id) {
      query += ' AND ist.warehouse_id = ?';
      params.push(warehouse_id);
    }

    query += ' GROUP BY ist.warehouse_id, w.name';

    const [valuation] = await db.query(query, params);

    return successResponse(res, 200, 'Inventory valuation retrieved successfully', valuation);

  } catch (error) {
    console.error('Get inventory valuation error:', error);
    return errorResponse(res, 500, 'Error retrieving inventory valuation', error);
  }
};

/**
 * @desc    Get low stock alerts
 * @route   GET /api/v1/inventory/alerts
 * @access  Private
 */
exports.getLowStockAlerts = async (req, res) => {
  try {
    const [alerts] = await db.query(`
      SELECT 
        ist.product_id,
        p.name as product_name,
        p.sku,
        p.category,
        ist.warehouse_id,
        w.name as warehouse_name,
        b.name as branch_name,
        ist.quantity as current_stock,
        p.min_stock_level,
        p.reorder_point,
        p.suggested_reorder_quantity,
        CASE 
          WHEN ist.quantity <= p.min_stock_level THEN 'CRITICAL'
          WHEN ist.quantity <= p.reorder_point THEN 'LOW'
          ELSE 'NORMAL'
        END as alert_level
      FROM inventory_stock ist
      INNER JOIN products p ON ist.product_id = p.id
      INNER JOIN warehouses w ON ist.warehouse_id = w.id
      INNER JOIN branches b ON w.branch_id = b.id
      WHERE p.active = TRUE 
        AND ist.quantity <= p.reorder_point
      ORDER BY 
        CASE 
          WHEN ist.quantity <= p.min_stock_level THEN 1
          WHEN ist.quantity <= p.reorder_point THEN 2
          ELSE 3
        END,
        ist.quantity ASC
    `);

    return successResponse(res, 200, 'Low stock alerts retrieved successfully', alerts);

  } catch (error) {
    console.error('Get low stock alerts error:', error);
    return errorResponse(res, 500, 'Error retrieving low stock alerts', error);
  }
};

module.exports = exports;