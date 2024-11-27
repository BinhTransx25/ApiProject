const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShipperReviewSchema = new Schema({
    rating: { type: Number, required: true }, // Số sao (1 đến 5)
    comment: { type: String, required: false }, // Bình luận của người dùng
    image: { type: String, required: false }, // Đường dẫn tới hình ản
    created_at: { type: Date, default: Date.now }, // Thời gian tạo đánh giá
    shipper_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipper', required: true }, // Liên kết đến shipper
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Liên kết đến người dùng
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true } // Liên kết đến đơn hàng
});

module.exports = mongoose.models.ShipperReview || mongoose.model('ShipperReview', ShipperReviewSchema);
