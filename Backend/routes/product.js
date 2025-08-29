const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

router.get('/', productController.getAllProducts);
router.get('/best-sellers', productController.getBestSellers);
router.get('/category/:category', productController.getProductsByCategory);
router.post('/', productController.addProduct);             // Admin only
router.patch('/:id', productController.updateProduct);      // Admin only
router.delete('/:id', productController.deleteProduct);     // Admin only

module.exports = router;
