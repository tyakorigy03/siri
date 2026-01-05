
// src/routes/auth.routes.js - Authentication Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

// Public routes
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);
router.put('/change-password', authController.changePassword);

module.exports = router;