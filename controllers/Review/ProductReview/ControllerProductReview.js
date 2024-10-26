const ModelProductReview = require('../ProductReview/ModelProductReview'); // Giả sử đường dẫn model ở đây
const ModelOrder = require('../../order/ModelOrder'); // Model đơn hàng để kiểm tra đơn hàng hợp lệ
const ModelProduct = require('../../products/ModelProduct');
// Tạo đánh giá mới
const create = async (order_id, product_id, user_id, rating, comment, image) => {
    if (!order_id || !product_id || !user_id) {
        const errorMessage = 'Missing required fields in request body';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    try {
        // Kiểm tra xem đơn hàng có tồn tại không
        let orderInDB = await ModelOrder.findById(order_id);
        if (!orderInDB) {
            throw new Error('Đơn hàng không tồn tại');
        }

        // Tìm sản phẩm trong danh sách items của đơn hàng và lấy số lượng
        const productInOrder = orderInDB.items.find(item => item.product_id.toString() === product_id.toString());
        if (!productInOrder) {
            throw new Error('Đơn hàng không chứa sản phẩm');
        }

        // Số lượng sản phẩm cùng loại
        const quantity = productInOrder.quantity;

        // Nếu số lượng > 1, tạo một đánh giá đại diện cho tất cả
        const reviews = [];
        for (let i = 0; i < quantity; i++) {
            const newReview = new ModelProductReview({
                rating,
                comment,
                image,
                order_id,
                product_id,
                user_id
            });
            reviews.push(newReview);
        }

        // Lưu tất cả đánh giá
        const savedReviews = await ModelProductReview.insertMany(reviews);
        return savedReviews;

    } catch (error) {
        console.log('Lỗi khi tạo đánh giá sản phẩm:', error);
        throw new Error('Lỗi khi tạo đánh giá sản phẩm');
    }
};

// Xóa đánh giá sản phẩm theo id
const remove = async (id) => {
    try {
        const reviewInDB = await ModelProductReview.findById(id);
        if (!reviewInDB) {
            throw new Error('Review not found');
        }
        let result = await ModelProductReview.findByIdAndDelete(id);
        return result;
    } catch (error) {
        console.log('Remove product review error:', error);
        throw new Error('Remove product review error');
    }
};

// Lấy tất cả đánh giá của một sản phẩm
const getAllByProduct = async (product_id) => {
    try {
        const reviews = await ModelProductReview.find({ product_id });
        return reviews;
    } catch (error) {
        console.log('Get product reviews error:', error);
        throw new Error('Get product reviews error');
    }
};

// Lấy tất cả đánh giá của một người dùng
const getAllByUser = async (user_id) => {
    try {
        const reviews = await ModelProductReview.find({ user_id });
        return reviews;
    } catch (error) {
        console.log('Get user reviews error:', error);
        throw new Error('Get user reviews error');
    }
};

// Lấy tất cả đánh giá của sản phẩm theo shopOwnerId
const getReviewProductByShopId = async (shopOwnerId) => {
    try {
        // Lấy ra đc 1 cái list tất cả sản phẩm của cửa hàng theo shopOwnerId
        const products = await ModelProduct.find({ 'shopOwner.shopOwner_id': shopOwnerId });
        console.log('list',products);
        
        // Nếu không có sản phẩm nào, trả về mảng rỗng
        if (products.length === 0) {
            return [];
        }

        // Lọc cái list đó, chỉ còn lại 1 cái list product_id
        const productIds = products.map(product => product._id);
        console.log('list productIds:',productIds);
        
        // Dò cái list product_id đó vào cái bảng ProductReview, Thằng nào có là lấy ra 
        const reviews = await ModelProductReview.find({ product_id: { $in: productIds } })
        console.log('list reviews',reviews);
        
        return reviews;
    } catch (error) {
        console.log('Get reviews by shop owner ID error:', error);
        throw new Error('Get reviews by shop owner ID error');
    }
};
module.exports = {
    create,
    remove,
    getAllByProduct,
    getAllByUser,
    getReviewProductByShopId
};
