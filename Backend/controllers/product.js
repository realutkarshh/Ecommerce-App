const Product = require('../models/Product');

// Get all products (returns array of products)
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products); // Direct array response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get best sellers (returns array of best sellers)
exports.getBestSellers = async (req, res) => {
    try {
        const products = await Product.find({ bestSeller: true });
        res.json(products); // Direct array response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get products by category (returns array filtered by category)
exports.getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category });
        res.json(products); // Direct array response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Add new product (returns the added product)
exports.addProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Admin: Update product (returns the updated product)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Admin: Delete product (returns success message)
exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// controllers/product.js
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
