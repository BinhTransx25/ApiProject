// ModelUser.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrderSchema = require('../order/ModelOrder').schema;

const UserSchema = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['customer', 'shopOwner'], default: 'customer' }, // Cập nhật cột role
    email: { type: String, required: true, unique: true },
    verified: { type: Boolean, default: false },
    carts: { type: [OrderSchema], default: [] }, // Mảng các đơn hàng
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.user || mongoose.model('user', UserSchema);
