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
    openingHours: { type: String, required: false, default: 0  },  // Giờ mở cửa (VD: "08:00")
    closeHours: { type: String, required: false,default: 0 },  // Giờ đóng cửa (VD: "22:00")
    status: { 
        type: String, 
        enum: ['Mở cửa', 'Đóng cửa', 'Ngưng hoạt động'], 
        default: 'Đóng cửa' 
    },
    distance: { type: Number, default: 0 },
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    imageVerified: { type: Array, required: false, default: [] },
});

module.exports = mongoose.models.shopOwner || mongoose.model('shopOwner', ShopOwnerSchema);
