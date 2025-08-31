// routes/product.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const upload = require('../middleware/upload');
const {isAdmin} = require('../middleware/auth'); // Your admin middleware

// Public routes
router.get('/', productController.getAllProducts);
router.get('/best-sellers', productController.getBestSellers);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

// Admin only routes with image upload
router.post('/', isAdmin, upload.single('image'), productController.addProduct);
router.patch('/:id', isAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', isAdmin, productController.deleteProduct);

module.exports = router;
