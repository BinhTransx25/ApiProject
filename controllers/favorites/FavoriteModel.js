// FavoriteModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FavoriteSchema = new Schema({
    user: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String },
        phone: { type: String },
        email: { type: String },
        image: { type: String }
    },
    shopOwner: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'shopOwner', required: true },
        name: { type: String },
        rating: { type: Number },
        address: { type: String },
        images: { type: Array }
    }, // Đổi thành shopOwner
    createdAt: { type: Date, default: Date.now },
    isDeleted:{type:Boolean, required:false, default:false},

});

module.exports = mongoose.models.Favorite || mongoose.model('Favorite', FavoriteSchema);
