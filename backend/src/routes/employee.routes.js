// src/routes/employee.routes.js - Employee Routes
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// TODO: Add employee routes when controllers are created
// For now, this is a placeholder to prevent errors

router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Employee routes not yet implemented'
  });
});

module.exports = router;
