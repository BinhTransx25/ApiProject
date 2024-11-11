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
            shopCategory_id: { type: mongoose.Schema.Types.ObjectId, ref: 'shopCategory', required: false },
            shopCategory_name: { type: String, required: false }
        },
    ],
    rating: { type: Number, required: false },
    countReview: { type: Number, required: false, default: 0 },
    images: { type: Array, required: false, default: [] },
    address: { type: String, required: false },
    distance: { type: Number, default: 0 },
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.shopOwner || mongoose.model('shopOwner', ShopOwnerSchema);
