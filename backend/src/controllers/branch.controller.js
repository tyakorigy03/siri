// src/controllers/branch.controller.js - Branch Controller
const db = require('../config/database');
const { successResponse, errorResponse, createdResponse, notFoundResponse, badRequestResponse } = require('../utils/response');

/**
 * @desc    Get all branches
 * @route   GET /api/v1/branches
 * @access  Private
 */
exports.getBranches = async (req, res) => {
  try {
    const { business_id, active } = req.query;
    const user_id = req.user.id;
    const user_role = req.user.role;

    let query = 'SELECT * FROM branches WHERE 1=1';
    const params = [];

    // Filter by business_id if provided
    if (business_id) {
      query += ' AND business_id = ?';
      params.push(business_id);
    }

    // Filter by active status if provided
    if (active !== undefined) {
      query += ' AND active = ?';
      params.push(active === 'true' || active === true ? 1 : 0);
    }

    // If user is not owner, only show branches they have access to
    if (user_role !== 'owner') {
      query += ` AND id IN (
        SELECT branch_id FROM user_branches WHERE user_id = ?
      )`;
      params.push(user_id);
    }

    query += ' ORDER BY name ASC';

    const [branches] = await db.query(query, params);

    return successResponse(res, 200, 'Branches retrieved successfully', branches);

  } catch (error) {
    console.error('Get branches error:', error);
    return errorResponse(res, 500, 'Error retrieving branches', error);
  }
};

/**
 * @desc    Get single branch by ID
 * @route   GET /api/v1/branches/:id
 * @access  Private
 */
exports.getBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    let query = 'SELECT * FROM branches WHERE id = ?';
    const params = [id];

    // If user is not owner, check if they have access to this branch
    if (user_role !== 'owner') {
      const [access] = await db.query(
        'SELECT * FROM user_branches WHERE user_id = ? AND branch_id = ?',
        [user_id, id]
      );

      if (access.length === 0) {
        return errorResponse(res, 403, 'You do not have access to this branch');
      }
    }

    const [branches] = await db.query(query, params);

    if (branches.length === 0) {
      return notFoundResponse(res, 'Branch not found');
    }

    return successResponse(res, 200, 'Branch retrieved successfully', branches[0]);

  } catch (error) {
    console.error('Get branch error:', error);
    return errorResponse(res, 500, 'Error retrieving branch', error);
  }
};

/**
 * @desc    Create new branch
 * @route   POST /api/v1/branches
 * @access  Private (owner, manager)
 */
exports.createBranch = async (req, res) => {
  try {
    const { business_id, name, code, branch_type, address, city, country, phone, email } = req.body;

    // Validation
    if (!name || !code) {
      return badRequestResponse(res, 'Name and code are required');
    }

    // Check if code already exists
    const [existing] = await db.query(
      'SELECT * FROM branches WHERE code = ?',
      [code]
    );

    if (existing.length > 0) {
      return badRequestResponse(res, 'Branch code already exists');
    }

    // Insert branch
    const [result] = await db.query(`
      INSERT INTO branches (
        business_id, name, code, branch_type, address, city, country, phone, email, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [business_id || 1, name, code, branch_type || 'STORE', address, city, country, phone, email]);

    const [newBranch] = await db.query(
      'SELECT * FROM branches WHERE id = ?',
      [result.insertId]
    );

    return createdResponse(res, 'Branch created successfully', newBranch[0]);

  } catch (error) {
    console.error('Create branch error:', error);
    return errorResponse(res, 500, 'Error creating branch', error);
  }
};

/**
 * @desc    Update branch
 * @route   PUT /api/v1/branches/:id
 * @access  Private (owner, manager)
 */
exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, branch_type, address, city, country, phone, email, active } = req.body;

    // Check if branch exists
    const [branches] = await db.query(
      'SELECT * FROM branches WHERE id = ?',
      [id]
    );

    if (branches.length === 0) {
      return notFoundResponse(res, 'Branch not found');
    }

    // If code is being updated, check if it already exists
    if (code && code !== branches[0].code) {
      const [existing] = await db.query(
        'SELECT * FROM branches WHERE code = ? AND id != ?',
        [code, id]
      );

      if (existing.length > 0) {
        return badRequestResponse(res, 'Branch code already exists');
      }
    }

    // Update branch
    await db.query(`
      UPDATE branches SET
        name = COALESCE(?, name),
        code = COALESCE(?, code),
        branch_type = COALESCE(?, branch_type),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        country = COALESCE(?, country),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        active = COALESCE(?, active),
        updated_at = NOW()
      WHERE id = ?
    `, [name, code, branch_type, address, city, country, phone, email, active, id]);

    const [updatedBranch] = await db.query(
      'SELECT * FROM branches WHERE id = ?',
      [id]
    );

    return successResponse(res, 200, 'Branch updated successfully', updatedBranch[0]);

  } catch (error) {
    console.error('Update branch error:', error);
    return errorResponse(res, 500, 'Error updating branch', error);
  }
};
