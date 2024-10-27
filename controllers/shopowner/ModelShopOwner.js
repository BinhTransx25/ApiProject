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
    rating: { type: Number, required: true },
    countReview: { type: Number, required: false, default:0 },
    images: { type: Array, required: true, default: [] },
    address: { type: String, required: true },  // Địa chỉ của shop
    distance: { type: Number, default: 0 },      // Quãng đường từ shop đến địa chỉ nhận hàng
    latitude: { type: Number, required: false },  // Vĩ độ
    longitude: { type: Number, required: false },  // Kinh độ
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.shopOwner || mongoose.model('shopOwner', ShopOwnerSchema);
