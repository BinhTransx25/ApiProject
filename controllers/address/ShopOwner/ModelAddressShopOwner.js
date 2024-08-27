const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopAddressSchema = new Schema({
    shopOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'shopOwner', required: true },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },  // Tọa độ vĩ độ của shop
    longitude: { type: Number, required: true }, // Tọa độ kinh độ của shop
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.shopAddress || mongoose.model('shopAddress', ShopAddressSchema);
