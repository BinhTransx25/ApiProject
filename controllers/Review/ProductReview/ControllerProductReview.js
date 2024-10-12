const ModelProductReview = require('../ProductReview/ModelProductReview'); // Giả sử đường dẫn model ở đây
const ModelOrder = require('../../order/ModelOrder'); // Model đơn hàng để kiểm tra đơn hàng hợp lệ

// Tạo đánh giá mới
const create = async (order_id, product_id, user_id, rating, comment, image ) => {
    if (!order_id || !product_id || !user_id  ) {
        const errorMessage = 'Missing required fields in request body';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    try {
    
        // Kiểm tra xem đơn hàng có tồn tại không
        let orderInDB = await ModelOrder.findById(order_id); // Không cần chuyển đổi
        
        if (!orderInDB) {
            throw new Error('Đơn hàng không tồn tại');
        }

        console.log('Dữ liệu nhận được:', orderInDB);

        const productExists = orderInDB.items.some(item => item._id.toString() === product_id.toString());
        
        console.log('Đặt hàng các mục:', orderInDB.items);
        console.log('ID sản phẩm:', product_id);
        
        if (!productExists) {
            throw new Error('Đơn hàng không chứa sản phẩm');
        }

        // Tạo giá trị
        const newReview = new ModelProductReview({
            rating,
            comment,
            image,
            order_id,
            product_id,
            user_id
        });
        
        const savedReview = await newReview.save();
        return savedReview;
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

module.exports = {
    create,
    remove,
    getAllByProduct,
    getAllByUser
};
