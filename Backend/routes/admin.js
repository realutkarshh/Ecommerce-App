// routes/admin.js - Update with new routes
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', isAuthenticated, isAdmin, adminController.getDashboardStats);

// Feedback management
router.get('/feedbacks', isAuthenticated, isAdmin, adminController.getAllFeedbacks);

// Order management by status
router.get('/orders/:status', isAuthenticated, isAdmin, adminController.getOrdersByStatus);

module.exports = router;
