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
    status: { type: String, enum: ['pending', 'processing', 'find delivery person', 'cancelled','completed'], default: 'pending' },
    shopOwner: {type: Object, required: true, default: {}},
    shipper: { type: Object, required: true, default: {}}, // Liên kết với shipper

});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
