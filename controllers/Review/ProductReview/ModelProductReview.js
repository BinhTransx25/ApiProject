const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductReviewSchema = new Schema({
    rating: { type: Number, required: true }, // Số sao (1 đến 5)
    comment: { type: String }, // Bình luận của người dùng
    image: { type: String }, // Đường dẫn tới hình ảnh sản phẩm (có thể không bắt buộc)
    created_at: { type: Date, default: Date.now }, // Thời gian tạo đánh giá
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }, // Liên kết đến đơn hàng
    // product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Liên kết đến sản phẩm
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Liên kết đến người dùng
});
module.exports = mongoose.models.ProductReview || 
                 mongoose.model('ProductReview', ProductReviewSchema);
