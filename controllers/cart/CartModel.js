const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    user: { type: Object, required: true },
    shopOwner: { type: Object, required: true }, // thông tin chủ cửa hàng
    products: { type: Array, required: true, default: [] }, // mảng chứa các sản phẩm
    status: { type: String, default: 'pending' }, // trạng thái giỏ hàng
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.cart || mongoose.model('cart', CartSchema);
