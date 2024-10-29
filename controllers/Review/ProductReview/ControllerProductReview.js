const ModelProductReview = require('../ProductReview/ModelProductReview'); // Giả sử đường dẫn model ở đây
const ModelOrder = require('../../order/ModelOrder'); // Model đơn hàng để kiểm tra đơn hàng hợp lệ
const ModelProduct = require('../../products/ModelProduct');
const ModelShopOwner = require('../../shopowner/ModelShopOwner')
const ModelUser = require('../../users/ModelUser')
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
        const order = await ModelOrder.findById(order_id);
        if (!order) {
            throw new Error('Order không tồn tại');
        }

        // Lấy thông tin user
        const user = await ModelUser.findById(user_id);
        if (!user) {
            throw new Error('User không tồn tại');
        }

        // Chuẩn bị dữ liệu cho các sản phẩm trong order
        const products = order.items.map((item) => ({
            _id: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        }));

        // Tạo đánh giá cho đơn hàng
        const review = await ModelProductReview.create({
            rating,
            comment,
            image,
            order_id,
            product: products, // Lưu danh sách sản phẩm vào đây
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                image: user.image
            } // Lưu thông tin người dùng
        });

        // Tăng countReview cho shop owner
        const shopOwnerId = order.shopOwner._id;
        await ModelShopOwner.findByIdAndUpdate(shopOwnerId, { $inc: { countReview: 1 } });

        return review;
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
        // Tìm tất cả các đánh giá có chứa sản phẩm với ID phù hợp trong cột `product`
        const reviews = await ModelProductReview.find({
            'product._id': product_id
        }).select('rating comment image user created_at'); // Chỉ lấy các trường cần thiết

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

// ControllerProductReview.js
const getReviewProductByShopId = async (shopOwnerId) => {
    try {
        // Lấy danh sách tất cả sản phẩm theo shopOwnerId
        const products = await ModelProduct.find({ 'shopOwner.shopOwner_id': shopOwnerId });

        // Nếu không có sản phẩm nào, trả về mảng rỗng
        if (products.length === 0) {
            return [];
        }

        // Lọc lấy danh sách product_id từ danh sách sản phẩm
        const productIds = products.map(product => product._id);

        // Dò tất cả các đánh giá có chứa product_id trong cột `product`
        const reviews = await ModelProductReview.find({
            'product._id': { $in: productIds }
        }).select('rating comment image user product created_at');

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
