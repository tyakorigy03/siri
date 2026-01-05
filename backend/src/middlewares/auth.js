
// src/middlewares/auth.js - JWT Authentication Middleware
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const [users] = await db.query(
        'SELECT id, name, email, role, active FROM users WHERE id = ?',
        [decoded.id]
      );

      if (!users.length) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }

      if (!users[0].active) {
        return res.status(401).json({
          success: false,
          message: 'User account is inactive'
        });
      }

      // Attach user to request
      req.user = users[0];
      next();

    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Restrict to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user has access to specific branch
exports.checkBranchAccess = async (req, res, next) => {
  try {
    const branchId = req.params.branchId || req.body.branch_id;
    
    if (!branchId) {
      return next();
    }

    // Owner has access to all branches
    if (req.user.role === 'owner') {
      return next();
    }

    // Check if user is assigned to this branch
    const [access] = await db.query(
      'SELECT * FROM user_branches WHERE user_id = ? AND branch_id = ?',
      [req.user.id, branchId]
    );

    if (!access.length) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this branch'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking branch access',
      error: error.message
    });
  }
};