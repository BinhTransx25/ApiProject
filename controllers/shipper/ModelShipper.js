const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShipperSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  assignedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point', // Set default value
    },
    coordinates: {
      type: [Number], // Array of [longitude, latitude]
      default: [0, 0], // Default coordinates
    }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Shipper || mongoose.model('Shipper', ShipperSchema);
