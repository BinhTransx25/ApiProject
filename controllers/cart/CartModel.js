const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    user: { type: Object, required: true },
    shopOwner: { type: Object, required: true }, // thông tin chủ cửa hàng
    products: { type: Array, required: true, default: [] }, // mảng chứa các sản phẩm
    status: { type: String, default: 'pending' }, // trạng thái giỏ hàng
    totalItem: { type: Number, default: 0 }, // tổng số lượng sản phẩm
    totalPrice: { type: Number, default: 0 }, // tổng tiền của tất cả sản phẩm
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.cart || mongoose.model('cart', CartSchema);
