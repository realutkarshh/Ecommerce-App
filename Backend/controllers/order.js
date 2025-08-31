// controllers/order.js
const Order = require('../models/Order');
const Feedback = require('../models/Feedback');

// Place a new order
exports.placeOrder = async (req, res) => {
    try {
        const { items, totalAmount } = req.body;
        const user = req.user._id;  // Get user from authenticated request
        const order = new Order({ 
            items, 
            totalAmount, 
            user, 
            status: 'pending'  // Changed from 'placed' to 'pending'
        });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// User: Get their own orders
exports.getUserOrders = async (req, res) => {
    try {
        const user = req.user._id;
        const orders = await Order.find({ user })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Get all orders - UPDATED for frontend
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'username email')  // Only get username and email
            .populate('items.product', 'name price image')  // Get product details
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Update order status - UPDATED for frontend
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;  // Get ID from URL params
        const { status } = req.body;  // Get status from request body
        
        const order = await Order.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        )
        .populate('user', 'username email')
        .populate('items.product', 'name price image');
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Admin: Get today's sales
exports.getTodaySales = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        
        const orders = await Order.find({ 
            createdAt: { $gte: start, $lt: end },
            status: { $ne: 'cancelled' }  // Exclude cancelled orders
        });
        
        const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        res.json({ totalSales, orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
