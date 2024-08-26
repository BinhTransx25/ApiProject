const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AddressSchema = require('../address/ModelAddress');

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
    status: { type: String, enum: ['pending', 'processing', 'cancelled'], default: 'pending' },
    shopOwner: {
        type: {
            _id: { type: Schema.Types.ObjectId, ref: 'ShopOwner', required: true },
            name: { type: String, required: true },
            phone: { type: Number, required: true },
        },
        required: true,
    },
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
