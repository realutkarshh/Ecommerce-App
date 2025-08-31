// routes/admin.js (create this file)
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', isAuthenticated, isAdmin, adminController.getDashboardStats);

module.exports = router;
