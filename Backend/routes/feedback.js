// routes/feedback.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback');
const { isAuthenticated } = require('../middleware/auth');

router.post('/', isAuthenticated, feedbackController.submitFeedback);
router.get('/eligible', isAuthenticated, feedbackController.getFeedbackEligibility);

module.exports = router;
