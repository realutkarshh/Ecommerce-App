// routes/order.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Customer routes
router.post('/', isAuthenticated, orderController.placeOrder);
router.get('/user', isAuthenticated, orderController.getUserOrders);

// Admin routes - these match your frontend API calls
router.get('/', isAuthenticated, isAdmin, orderController.getAllOrders);  // This matches your frontend
router.patch('/:id', isAuthenticated, isAdmin, orderController.updateOrderStatus);  // Updated to use :id
router.get('/sales/today', isAuthenticated, isAdmin, orderController.getTodaySales);

module.exports = router;
