// models/Order.js - Update the status enum
const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    paymentMethod: { 
        type: String, 
        enum: ['online', 'cod'], 
        required: true 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' 
    },
    razorpayOrderId: { type: String }, // For Razorpay integration
    razorpayPaymentId: { type: String },
    status: { 
        type: String, 
        enum: ['placed', 'preparing', 'prepared', 'out_for_delivery', 'delivered'],
        default: 'placed'
    },
    deliveryAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
