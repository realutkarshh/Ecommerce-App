const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.post('/', isAuthenticated, orderController.placeOrder);
router.get('/user', isAuthenticated, orderController.getUserOrders);
router.get('/admin', isAuthenticated, isAdmin, orderController.getAllOrders);
router.patch('/status', isAuthenticated, isAdmin, orderController.updateOrderStatus);
router.get('/sales/today', isAuthenticated, isAdmin, orderController.getTodaySales);

module.exports = router;
