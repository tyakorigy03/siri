// src/routes/branch.routes.js - Branch Routes
const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Get all branches
router.get('/', branchController.getBranches);

// Get single branch
router.get('/:id', branchController.getBranch);

// Create branch (owner, manager only)
router.post(
  '/',
  authorize('owner', 'manager'),
  branchController.createBranch
);

// Update branch (owner, manager only)
router.put(
  '/:id',
  authorize('owner', 'manager'),
  branchController.updateBranch
);

module.exports = router;
