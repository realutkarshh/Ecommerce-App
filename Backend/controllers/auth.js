const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { username, email, password, contact } = req.body;
        const user = new User({ username, email, password, contact });
        await user.save();
        const token = user.generateAuthToken();
        res.status(201).json({ token, username: user.username });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// In your backend auth controller (controllers/auth.js or similar)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and verify password (your existing logic)
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,  // Note: using 'id' not 'userId' 
        email: user.email,
        isAdmin: user.isAdmin 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // IMPORTANT: Return user object in response (this was missing)
    res.json({
      token,
      user: {  // <-- This was missing in your backend response
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin || false,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
