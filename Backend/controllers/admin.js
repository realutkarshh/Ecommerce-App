// controllers/admin.js (create this file)
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        console.log('Dashboard stats endpoint called'); // Debug log
        
        const [totalProducts, totalOrders, totalUsers, recentOrders] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments({ isAdmin: { $ne: true } }), // Count only customers
            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('_id totalAmount createdAt status')
        ]);

        // Calculate total revenue from completed orders
        const revenueResult = await Order.aggregate([
            { $match: { status: { $in: ['completed', 'delivered'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenue = revenueResult[0]?.total || 0;

        const statsData = {
            totalProducts,
            totalOrders,
            totalUsers,
            totalRevenue,
            recentOrders
        };

        console.log('Sending stats:', statsData); // Debug log
        res.json(statsData);
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: error.message });
    }
};
