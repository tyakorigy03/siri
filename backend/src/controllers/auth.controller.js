
// src/controllers/auth.controller.js - Authentication Controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { successResponse, errorResponse, createdResponse, unauthorizedResponse, badRequestResponse } = require('../utils/response');


exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existingUsers.length > 0) {
      return badRequestResponse(res, 'Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone, active) VALUES (?, ?, ?, ?, ?, TRUE)',
      [name, email, password_hash, role, phone || null]
    );

    // Get created user
    const [users] = await db.query(
      'SELECT id, name, email, role, phone, active, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = users[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return createdResponse(res, 'User registered successfully', {
      user,
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 500, 'Error registering user', error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user by email
    const [users] = await db.query(
      'SELECT id, name, email, password_hash, role, phone, active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return unauthorizedResponse(res, 'Invalid credentials');
    }

    const user = users[0];

    // Check if user is active
    if (!user.active) {
      return unauthorizedResponse(res, 'Account is inactive. Please contact administrator.');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return unauthorizedResponse(res, 'Invalid credentials');
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove password hash from response
    delete user.password_hash;

    return successResponse(res, 200, 'Login successful', {
      user,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Error logging in', error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, phone, active, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return notFoundResponse(res, 'User not found');
    }

    // Get user branches
    const [branches] = await db.query(`
      SELECT b.id, b.name, b.code, ub.role, ub.is_primary
      FROM user_branches ub
      INNER JOIN branches b ON ub.branch_id = b.id
      WHERE ub.user_id = ? AND b.active = TRUE
    `, [req.user.id]);

    const userData = {
      ...users[0],
      branches
    };

    return successResponse(res, 200, 'User profile retrieved', userData);

  } catch (error) {
    console.error('GetMe error:', error);
    return errorResponse(res, 500, 'Error retrieving user profile', error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // Here we can log the logout event for audit purposes
    
    await db.query(
      'INSERT INTO audit_logs (business_id, user_id, action, table_name, record_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [1, req.user.id, 'LOGOUT', 'users', req.user.id.toString()]
    );

    return successResponse(res, 200, 'Logged out successfully');

  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 500, 'Error logging out', error);
  }
};

/**
 * @desc    Refresh token
 * @route   POST /api/v1/auth/refresh
 * @access  Private
 */
exports.refreshToken = async (req, res) => {
  try {
    // Generate new JWT token
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return successResponse(res, 200, 'Token refreshed successfully', { token });

  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse(res, 500, 'Error refreshing token', error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const [users] = await db.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return notFoundResponse(res, 'User not found');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isMatch) {
      return badRequestResponse(res, 'Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [password_hash, req.user.id]
    );

    return successResponse(res, 200, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 500, 'Error changing password', error);
  }
};

module.exports = exports;