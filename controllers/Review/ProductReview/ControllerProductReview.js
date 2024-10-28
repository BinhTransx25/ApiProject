const ModelProductReview = require('../ProductReview/ModelProductReview'); // Giả sử đường dẫn model ở đây
const ModelOrder = require('../../order/ModelOrder'); // Model đơn hàng để kiểm tra đơn hàng hợp lệ
const ModelProduct = require('../../products/ModelProduct');
const ModelShopOwner = require('../../shopowner/ModelShopOwner')

// Tạo đánh giá mới
// Tạo đánh giá mới cho sản phẩm
const create = async (order_id, user_id, rating, comment, image) => {
    if (!order_id || !user_id) {
        const errorMessage = 'Thiếu các trường bắt buộc trong request body';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    try {
        // Lấy thông tin order để biết được các sản phẩm trong order
        const order = await ModelOrder.findById(order_id)
        if (!order) {
            throw new Error('Order không tồn tại');
        }

        // Lấy shopOwnerId từ đơn hàng
        const shopOwnerId = order.shopOwner._id;

        // Tạo mảng chứa các review được tạo thành công
        const reviews = [];

        // Duyệt qua các sản phẩm trong order và tạo review cho từng sản phẩm
        for (let item of order.items) {
            const product_id = item._id;

            // Kiểm tra xem đã có review cho sản phẩm này và order này chưa
            const existingReview = await ModelProductReview.findOne({ product_id, order_id, user_id });
            if (!existingReview) {
                // Tạo review cho sản phẩm này
                const review = await ModelProductReview.create({
                    rating,
                    comment,
                    image,
                    order_id,
                    product_id,
                    user_id
                });
                reviews.push(review);
            }
        }

        // Tăng countReview cho shop owner
        await ModelShopOwner.findByIdAndUpdate(shopOwnerId, { $inc: { countReview: 1 } });

        return reviews;
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
