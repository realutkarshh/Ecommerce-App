// controllers/order.js
const Order = require('../models/Order');
const User = require('../models/User'); // Add this import
const Feedback = require('../models/Feedback');

// controllers/order.js - Update placeOrder function
exports.placeOrder = async (req, res) => {
    try {
        console.log('=== ORDER PLACEMENT DEBUG ===');
        console.log('Request body:', req.body);
        console.log('User from middleware:', req.user);
        console.log('User ID:', req.user?._id);
        
        const { items, totalAmount, paymentMethod, deliveryAddress, razorpayOrderId } = req.body;
        const user = req.user._id;
        
        // Validate all required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items array is required and cannot be empty' });
        }
        
        if (!totalAmount || typeof totalAmount !== 'number') {
            return res.status(400).json({ error: 'Total amount is required and must be a number' });
        }
        
        if (!paymentMethod || !['online', 'cod'].includes(paymentMethod)) {
            return res.status(400).json({ error: 'Payment method must be either "online" or "cod"' });
        }
        
        if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zip) {
            return res.status(400).json({ error: 'Complete delivery address is required' });
        }
        
        console.log('Creating order with data:', {
            items,
            totalAmount,
            user,
            paymentMethod,
            deliveryAddress,
            razorpayOrderId
        });
        
        const order = new Order({ 
            items, 
            totalAmount, 
            user,
            paymentMethod,
            deliveryAddress,
            razorpayOrderId, // For online payments
            status: 'placed',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
        });
        
        console.log('Order object before saving:', order);
        
        await order.save();
        
        console.log('Order saved successfully:', order._id);
        
        // Clear user's cart from database after successful order
        const userDoc = await User.findById(user);
        if (userDoc) {
            userDoc.cart.items = [];
            userDoc.cart.total = 0;
            await userDoc.save();
            console.log('User cart cleared from database');
        }
        
        // Populate order details for response
        await order.populate('items.product', 'name price image');
        await order.populate('user', 'username email');
        
        console.log('Order populated and ready to send');
        
        res.status(201).json(order);
    } catch (error) {
        console.error('=== ORDER PLACEMENT ERROR ===');
        console.error('Error details:', error);
        console.error('Stack trace:', error.stack);
        res.status(400).json({ error: error.message });
    }
};



// Add function to update payment status (for Razorpay webhook)
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { orderId, paymentId, status } = req.body;
        
        const order = await Order.findOneAndUpdate(
            { razorpayOrderId: orderId },
            { 
                paymentStatus: status,
                razorpayPaymentId: paymentId
            },
            { new: true }
        );
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(order);
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
