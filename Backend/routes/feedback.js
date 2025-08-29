const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback');
const { isAuthenticated } = require('../middleware/auth');

router.post('/', isAuthenticated, feedbackController.submitFeedback);

module.exports = router;
