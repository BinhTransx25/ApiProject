const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    user: { type: Object, required: true, default: {} },
    product: { type: Object, required: true, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.models.cart || mongoose.model('cart', CartSchema);