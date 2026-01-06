// src/routes/staffSession.routes.js - Staff Cash Session Routes
const express = require('express');
const router = express.Router();
const staffSessionController = require('../controllers/staffSession.controller');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Open session (cashier, receptionist, salesperson)
router.post(
  '/open',
  authorize('cashier', 'receptionist', 'salesperson', 'manager', 'owner'),
  staffSessionController.openStaffSession
);

// Close session
router.post('/close', staffSessionController.closeStaffSession);

// Get current session (must come before /:id)
router.get('/current', staffSessionController.getCurrentSession);

// Get session history (managers can see all, others see only their own)
router.get('/history', staffSessionController.getSessionHistory);

// Get staff variance report (manager, owner, accountant)
router.get(
  '/variance-report',
  authorize('manager', 'owner', 'accountant'),
  staffSessionController.getStaffVarianceReport
);

// Get all sessions (for managers to see all sessions) - same as history
router.get('/', staffSessionController.getSessionHistory);

// Get single session details (must be last to avoid matching /current, /history, etc.)
router.get('/:id', staffSessionController.getSessionDetails);

module.exports = router;
