const Order = require('../models/Order');
const Feedback = require('../models/Feedback');

// Place a new order
exports.placeOrder = async (req, res) => {
    try {
        const { items, totalAmount, user } = req.body;
        const order = new Order({ items, totalAmount, user, status: 'placed' });
        await order.save();
        // Optionally clear user cart
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// User: Get their own orders
exports.getUserOrders = async (req, res) => {
    try {
        const user = req.user._id;
        const orders = await Order.find({ user }).populate('items.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('items.product user');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
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
        const orders = await Order.find({ createdAt: { $gte: start, $lt: end } });
        const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        res.json({ totalSales, orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
