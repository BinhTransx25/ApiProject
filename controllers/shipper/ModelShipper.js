const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrderSchema = require('../order/ModelOrder');

const ShipperSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  rating: { type: String, required: true },
  role: { type: String, enum: ['shipper'], default: 'shipper' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  image: { type: Array, required: true, default: [] },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true }, // Giới tính
  birthDate: { type: Date, required: true }, // Ngày sinh
  vehicleBrand: { type: String, required: true }, // Hãng xe
  vehiclePlate: { type: String, required: true } // Biển số xe
});

module.exports = mongoose.models.Shipper || mongoose.model('Shipper', ShipperSchema);
