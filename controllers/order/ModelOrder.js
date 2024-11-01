const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AddressSchema = require('../address/User/ModelAddressUser');

const OrderItemSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    // description: { type: String, required: false },
    images: { type: Array, required: true },
    note: { type: String, required: false },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
});

const OrderSchema = new Schema({
    items: [OrderItemSchema],
    orderDate: { type: Date, default: Date.now },
    shippingAddress: { type: AddressSchema.schema, required: false },
    paymentMethod: { type: String, enum: ['Tiền mặt', 'PayOS', 'ZaloPay'], required: true },
    status: {
        type: String,
        enum: ['Chưa giải quyết', 'Chờ thanh toán', 'Tìm người giao hàng',
            'Người dùng đã hủy đơn', 'Đơn hàng đã được giao hoàn tất',
            'Đang giao hàng', 'Nhà hàng đã hủy đơn', 'Shipper đã hủy đơn'],
        default: function () {
            // Tự động thiết lập trạng thái dựa trên phương thức thanh toán
            return this.paymentMethod === 'PayOS' || this.paymentMethod === 'ZaloPay' ? 'Chờ thanh toán' : 'Chưa giải quyết';
        }
    },
    totalPrice: { type: Number, required: false, default: 0 },
    user: { type: Object, required: true, default: {} },
    shopOwner: { type: Object, required: true, default: {} },
    shipper: { type: Object, required: false, default: {} },
    // image: { type: Array, required: true, default: [] },
    voucher: { type: Object, require: false, default: {} },
    shippingfee: { type: Number, required: false, default: 0 },
    updatedAt: { type: Date, default: Date.now },
    distance: { type: Number, required: false, default: 0 },
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
