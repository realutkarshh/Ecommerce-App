const Feedback = require('../models/Feedback');

// Submit feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { order, product, rating, comment } = req.body;
        const feedback = new Feedback({ user: req.user._id, order, product, rating, comment });
        await feedback.save();
        res.status(201).json(feedback);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
