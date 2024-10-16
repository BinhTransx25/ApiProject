const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AddressSchema = require('../address/User/ModelAddressUser');

const OrderItemSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
});

const OrderSchema = new Schema({
    items: [OrderItemSchema],
    orderDate: { type: Date, default: Date.now },
    shippingAddress: { type: AddressSchema.schema, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['Chưa giải quyết', 'Tìm người giao hàng', 'Người dùng đã hủy đơn','Đơn hàng đã được giao hoàn tất','Đang giao hàng','Nhà hàng đã hủy đơn','Shipper đã hủy đơn' ], default: 'Chưa giải quyết' },
    shopOwner: {type: Object, required: true, default: {}},
    shipper: { type: Object, required: true, default: {}}, 
    image: { type: Array, required: true, default: [] },

});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
