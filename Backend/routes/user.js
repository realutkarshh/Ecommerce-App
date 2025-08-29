// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

router.get('/profile', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.user._id); // req.user set by your auth middleware
  res.json({ username: user.username, email: user.email, contact: user.contact });
});

module.exports = router;
