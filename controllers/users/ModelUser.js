// ModelUser.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrderSchema = require('../order/ModelOrder').schema;
const UserAddressSchema = require('../address/User/ModelAddressUser').schema;

const UserSchema = new Schema({
    name: { type: String, default: "" },
    password: { type: String, required: true },
    phone: { type: String,default:"" },
    role: { type: String, enum: ['customer', 'shopOwner'], default: 'customer' }, // Cập nhật cột role
    email: { type: String, required: true, unique: true },
    photo:{type:String,default:""}, 
    verified: { type: Boolean, default: false },
    carts: { type: [OrderSchema], default: [] }, // Mảng các đơn hàng
    address: { type: [UserAddressSchema], default: [] }, // Mảng các địa chỉ đã lưu 
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.user || mongoose.model('user', UserSchema);
