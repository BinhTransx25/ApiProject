const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    recipientName: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, required: true },
    user: { type: Object, default: {} },
});

module.exports = mongoose.models.address || mongoose.model('address', AddressSchema);
