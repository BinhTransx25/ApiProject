const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FavoriteSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'shopOwner', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Favorite || mongoose.model('Favorite', FavoriteSchema);
