
// src/controllers/product.controller.js - Product Controller
const db = require('../config/database');
const { successResponse, errorResponse, createdResponse, notFoundResponse, paginatedResponse } = require('../utils/response');

/**
 * @desc    Get all products
 * @route   GET /api/v1/products
 * @access  Private
 */
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, active } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, 
        (SELECT SUM(quantity) FROM inventory_stock WHERE product_id = p.id) as total_stock
      FROM products p
      WHERE 1=1
    `;
    const params = [];

    // Add filters
    if (search) {
      query += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (active !== undefined) {
      query += ' AND p.active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    // Get total count
    const countQuery = query.replace('SELECT p.*, (SELECT SUM(quantity) FROM inventory_stock WHERE product_id = p.id) as total_stock', 'SELECT COUNT(*) as total');
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Add pagination
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await db.query(query, params);

    return paginatedResponse(res, products, parseInt(page), parseInt(limit), total, 'Products retrieved successfully');

  } catch (error) {
    console.error('Get products error:', error);
    return errorResponse(res, 500, 'Error retrieving products', error);
  }
};

/**
 * @desc    Get single product
 * @route   GET /api/v1/products/:id
 * @access  Private
 */
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db.query(`
      SELECT p.*,
        (SELECT SUM(quantity) FROM inventory_stock WHERE product_id = p.id) as total_stock
      FROM products p
      WHERE p.id = ?
    `, [id]);

    if (products.length === 0) {
      return notFoundResponse(res, 'Product not found');
    }

    // Get stock by warehouse
    const [stockByWarehouse] = await db.query(`
      SELECT ist.*, w.name as warehouse_name, b.name as branch_name
      FROM inventory_stock ist
      INNER JOIN warehouses w ON ist.warehouse_id = w.id
      INNER JOIN branches b ON w.branch_id = b.id
      WHERE ist.product_id = ?
    `, [id]);

    // Get variants if any
    const [variants] = await db.query(
      'SELECT * FROM product_variants WHERE product_id = ? AND active = TRUE',
      [id]
    );

    const productData = {
      ...products[0],
      stock_by_warehouse: stockByWarehouse,
      variants: variants
    };

    return successResponse(res, 200, 'Product retrieved successfully', productData);

  } catch (error) {
    console.error('Get product error:', error);
    return errorResponse(res, 500, 'Error retrieving product', error);
  }
};

/**
 * @desc    Create product
 * @route   POST /api/v1/products
 * @access  Private (manager, owner)
 */
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Handle image upload if exists
    if (req.cloudinaryResult) {
      productData.image_url = req.cloudinaryResult.url;
    }

    const [result] = await db.query(
      `INSERT INTO products (
        business_id, name, sku, barcode, category, subcategory, description,
        vat_applicable, vat_rate, sale_price, cost_price, stock_unit,
        min_stock_level, max_stock_level, reorder_point, suggested_reorder_quantity,
        track_serial, track_batch, image_url, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        productData.business_id,
        productData.name,
        productData.sku || null,
        productData.barcode || null,
        productData.category || null,
        productData.subcategory || null,
        productData.description || null,
        productData.vat_applicable !== false,
        productData.vat_rate || 18,
        productData.sale_price,
        productData.cost_price || null,
        productData.stock_unit || 'PCS',
        productData.min_stock_level || 0,
        productData.max_stock_level || 0,
        productData.reorder_point || 0,
        productData.suggested_reorder_quantity || 0,
        productData.track_serial || false,
        productData.track_batch || false,
        productData.image_url || null
      ]
    );

    const [product] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    return createdResponse(res, 'Product created successfully', product[0]);

  } catch (error) {
    console.error('Create product error:', error);
    return errorResponse(res, 500, 'Error creating product', error);
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/v1/products/:id
 * @access  Private (manager, owner)
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Product not found');
    }

    // Handle image upload if exists
    if (req.cloudinaryResult) {
      updateData.image_url = req.cloudinaryResult.url;
    }

    // Build update query
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      return badRequestResponse(res, 'No fields to update');
    }

    values.push(id);
    await db.query(
      `UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    const [product] = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    return successResponse(res, 200, 'Product updated successfully', product[0]);

  } catch (error) {
    console.error('Update product error:', error);
    return errorResponse(res, 500, 'Error updating product', error);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/products/:id
 * @access  Private (owner)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Product not found');
    }

    // Soft delete (set active to false)
    await db.query('UPDATE products SET active = FALSE WHERE id = ?', [id]);

    return successResponse(res, 200, 'Product deleted successfully');

  } catch (error) {
    console.error('Delete product error:', error);
    return errorResponse(res, 500, 'Error deleting product', error);
  }
};

/**
 * @desc    Get product categories
 * @route   GET /api/v1/products/categories
 * @access  Private
 */
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT DISTINCT category, COUNT(*) as product_count
      FROM products
      WHERE category IS NOT NULL AND active = TRUE
      GROUP BY category
      ORDER BY category
    `);

    return successResponse(res, 200, 'Categories retrieved successfully', categories);

  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse(res, 500, 'Error retrieving categories', error);
  }
};

module.exports = exports;