const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CoordinatesSchema = new Schema({
    latitude: { type: Number, required: false },  // Vĩ độ
    longitude: { type: Number, required: false }  // Kinh độ
});

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
    address: { type: String, required: true },  // Địa chỉ của shop
    coordinates: { type: CoordinatesSchema, required: true },  // Tọa độ của shop (vĩ độ và kinh độ)
    distance: { type: Number, default: 0 },      // Quãng đường từ shop đến địa chỉ nhận hàng
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.shopOwner || mongoose.model('shopOwner', ShopOwnerSchema);
