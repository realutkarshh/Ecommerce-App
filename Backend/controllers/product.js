// controllers/product.js
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

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

// Get single product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Admin: Add new product with image upload
exports.addProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Product image is required' });
        }

        const { name, description, category, price, bestSeller } = req.body;

        const product = new Product({
            name,
            description,
            category,
            price,
            bestSeller: bestSeller === 'true' || bestSeller === true,
            image: req.file.path, // Cloudinary URL
            imagePublicId: req.file.filename, // Cloudinary public ID
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Admin: Update product with optional new image
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // If new image is uploaded, delete old image from Cloudinary
        if (req.file) {
            if (product.imagePublicId) {
                await cloudinary.uploader.destroy(product.imagePublicId);
            }
            product.image = req.file.path;
            product.imagePublicId = req.file.filename;
        }

        // Update other fields
        const allowedUpdates = ['name', 'description', 'category', 'price', 'bestSeller'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Admin: Delete product and its image from Cloudinary
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Delete image from Cloudinary if it exists
        if (product.imagePublicId) {
            await cloudinary.uploader.destroy(product.imagePublicId);
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
