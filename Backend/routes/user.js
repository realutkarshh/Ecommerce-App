// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated, isAdmin} = require('../middleware/auth');

router.get('/profile', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.user._id); // req.user set by your auth middleware
  res.json({ username: user.username, email: user.email, contact: user.contact });
});

// ========== SPECIFIC ROUTES FIRST ==========

// ========== WISHLIST ROUTES ==========

// Get user's wishlist
router.get('/wishlist', isAuthenticated, async (req, res) => {
  try {
    console.log('User ID:', req.user._id);
    const user = await User.findById(req.user._id).populate('wishlist');
    console.log('User wishlist:', JSON.stringify(user.wishlist, null, 2));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.wishlist);
  } catch (error) {
    console.error('Wishlist loading error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if item is in wishlist
router.get('/wishlist/check/:productId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isInWishlist = user.wishlist.includes(req.params.productId);
    res.json({ isInWishlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to wishlist
router.post('/wishlist/:productId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Check if product is already in wishlist
    if (!user.wishlist.includes(req.params.productId)) {
      user.wishlist.push(req.params.productId);
      await user.save();
    }
    
    await user.populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from wishlist
router.delete('/wishlist/:productId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    
    await user.populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== CART ROUTES ==========

// Get user's cart
router.get('/cart', isAuthenticated, async (req, res) => {
  try {
    console.log('User ID:', req.user._id);
    const user = await User.findById(req.user._id).populate('cart.items.product');
    console.log('User cart:', JSON.stringify(user.cart, null, 2));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.cart);
  } catch (error) {
    console.error('Cart loading error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get cart count
router.get('/cart/count', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const count = user.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add/update item in cart
router.post('/cart/:productId', isAuthenticated, async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const user = await User.findById(req.user._id);

    // Find existing item in cart
    const itemIndex = user.cart.items.findIndex(
      item => item.product.toString() === req.params.productId
    );

    if (itemIndex > -1) {
      // Update existing item quantity
      user.cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      user.cart.items.push({ 
        product: req.params.productId, 
        quantity 
      });
    }

    await user.save();
    
    // Populate and calculate total
    await user.populate('cart.items.product');
    user.cart.total = user.cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    
    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item quantity in cart
router.put('/cart/:productId', isAuthenticated, async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      user.cart.items = user.cart.items.filter(
        item => item.product.toString() !== req.params.productId
      );
    } else {
      // Update quantity
      const itemIndex = user.cart.items.findIndex(
        item => item.product.toString() === req.params.productId
      );
      
      if (itemIndex > -1) {
        user.cart.items[itemIndex].quantity = quantity;
      }
    }

    await user.save();
    
    // Populate and calculate total
    await user.populate('cart.items.product');
    user.cart.total = user.cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    
    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
router.delete('/cart/:productId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart.items = user.cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    await user.save();
    
    // Populate and calculate total
    await user.populate('cart.items.product');
    user.cart.total = user.cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    
    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear entire cart
router.delete('/cart', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart.items = [];
    user.cart.total = 0;
    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== PARAMETERIZED ROUTES LAST ==========

// Get all users (admin only)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user by ID (admin only) - THIS MUST COME LAST
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;