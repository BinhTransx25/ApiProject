const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopOwnerSchema = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['shopOwner'], default: 'shopOwner' },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    shopCategory: [
        {
            shopCategory_id: { type: mongoose.Schema.Types.ObjectId, ref: 'shopCategory', required: true },
            shopCategory_name: { type: String, required: true }
        },
    ],
    // latitude: { type: Number, required: true },  // Tọa độ vĩ độ của shop
    // longitude: { type: Number, required: true }, // Tọa độ kinh độ của shop
    // distance: { type: Number, default: 0 },      // Quãng đường từ shop đến địa chỉ nhận hàng
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.shopOwner || mongoose.model('shopOwner', ShopOwnerSchema);
