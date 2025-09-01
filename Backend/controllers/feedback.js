const Feedback = require('../models/Feedback');
const Order = require('../models/Order'); // Add this line - it was missing!


// controllers/feedback.js - Add get feedback for order
exports.submitFeedback = async (req, res) => {
    try {
        const { order, product, rating, comment } = req.body;
        
        // Check if order belongs to user and is delivered
        const orderExists = await Order.findOne({
            _id: order,
            user: req.user._id,
            status: 'delivered'
        });
        
        if (!orderExists) {
            return res.status(400).json({ error: 'Order not found or not delivered yet' });
        }
        
        // Check if feedback already exists
        const existingFeedback = await Feedback.findOne({
            user: req.user._id,
            order,
            product
        });
        
        if (existingFeedback) {
            return res.status(400).json({ error: 'Feedback already submitted for this product' });
        }
        
        const feedback = new Feedback({ 
            user: req.user._id, 
            order, 
            product, 
            rating, 
            comment 
        });
        
        await feedback.save();
        
        // Populate for response
        await feedback.populate('product', 'name image');
        
        res.status(201).json(feedback);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get feedback eligibility for user's orders
exports.getFeedbackEligibility = async (req, res) => {
    try {
        const deliveredOrders = await Order.find({
            user: req.user._id,
            status: 'delivered'
        }).populate('items.product', 'name image');
        
        // Get existing feedbacks
        const existingFeedbacks = await Feedback.find({
            user: req.user._id
        });
        
        const feedbackProductIds = existingFeedbacks.map(f => f.product.toString());
        
        // Filter orders to show only products without feedback
        const eligibleOrders = deliveredOrders.map(order => ({
            ...order.toObject(),
            items: order.items.filter(item => 
                !feedbackProductIds.includes(item.product._id.toString())
            )
        })).filter(order => order.items.length > 0);
        
        res.json(eligibleOrders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
