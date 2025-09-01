// controllers/admin.js (create this file)
const Order = require('../models/Order');
const Feedback = require('../models/Feedback');
const Product = require('../models/Product');
const User = require('../models/User');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const [totalProducts, totalOrders, totalUsers, recentOrders] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments({ isAdmin: { $ne: true } }),
            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('user', 'username email')
                .populate('items.product', 'name price')
        ]);

        // Calculate total revenue from completed orders
        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenue = revenueResult[0]?.total || 0;

        res.json({
            totalProducts,
            totalOrders,
            totalUsers,
            totalRevenue,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all feedbacks for admin panel
exports.getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('user', 'username email')
            .populate('order', '_id totalAmount status createdAt')
            .populate('product', 'name price image')
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get orders by status for admin filtering
exports.getOrdersByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const orders = await Order.find({ status })
            .populate('user', 'username email')
            .populate('items.product', 'name price image')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
