// ModelUser.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    name: { type: String, default: "" },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ['admin'], default: 'admin' }, // Cập nhật cột role
    email: { type: String, required: true, unique: true },
    image: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['Hoạt động', 'Tài khoản bị khóa',], 
        default: 'Hoạt động' 
    },
    isDeleted:{type:Boolean, required:false, default:false},

});

module.exports = mongoose.models.admin || mongoose.model('admin', AdminSchema);
