const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['Burger', 'Pizza', 'Fries', 'Drink', 'Dessert'], required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    bestSeller: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
