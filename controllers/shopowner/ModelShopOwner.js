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
    rating: { type: Number, required: false, default: 0 },
    countReview: { type: Number, required: false, default: 0 },
    images: { type: Array, required: true, default: [] },
    address: { type: String, required: true },
    distance: { type: Number, default: 0 },
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.shopOwner || mongoose.model('shopOwner', ShopOwnerSchema);
