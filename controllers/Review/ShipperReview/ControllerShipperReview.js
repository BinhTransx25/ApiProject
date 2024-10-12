// Controller cho ShipperReview
const ModelShipperReview = require('../ShipperReview/ModelShipperReview');
const ModelOrder = require('../../order/ModelOrder'); // Model đơn hàng để kiểm tra đơn hàng hợp lệ
const ModelShipper = require('../../shipper/ModelShipper'); // Model đơn hàng để kiểm tra đơn hàng hợp lệ

// Thêm đánh giá mới
const create = async (order_id, shipper_id, user_id, rating, comment, image) => {

    if (!order_id || !shipper_id || !user_id) {
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

        // Kiểm tra xem shipper có tồn tại không
        let shipperInDB = await ModelShipper.findById(shipper_id); // Không cần chuyển đổi

        if (!shipperInDB) {
            throw new Error('shipper không tồn tại');
        }

        console.log('Dữ liệu nhận được:', orderInDB);


        const newReview = new ModelShipperReview({
            rating,
            comment,
            image,
            order_id,
            shipper_id,
            user_id
        });
        const savedReview = await newReview.save();
        return savedReview;
    } catch (error) {
        console.log('Lỗi khi tạo đánh giá shipper:', error);
        throw new Error('Lỗi khi tạo đánh giá shipper');
    }
};

// Lấy tất cả đánh giá
const getAll = async () => {
    try {
        let result = await ModelShipperReview.find().populate('shipper_id').populate('product_id').populate('order_id');
        return result;
    } catch (error) {
        console.log('Get all ShipperReviews error:', error);
        throw new Error('Get all ShipperReviews error');
    }
};

// Lấy đánh giá theo ID
const getById = async (id) => {
    try {
        let result = await ModelShipperReview.findById(id).populate('shipper_id').populate('product_id').populate('order_id');
        if (!result) {
            throw new Error('ShipperReview not found');
        }
        return result;
    } catch (error) {
        console.log('Get ShipperReview by ID error:', error);
        throw new Error('Get ShipperReview by ID error');
    }
};

// Xóa đánh giá theo ID
const remove = async (id) => {
    try {
        const reviewInDB = await ModelShipperReview.findById(id);
        if (!reviewInDB) {
            throw new Error('ShipperReview not found');
        }
        let result = await ModelShipperReview.findByIdAndDelete(id);
        return result;
    } catch (error) {
        console.log('Remove ShipperReview error:', error);
        throw new Error('Remove ShipperReview error');
    }
};

module.exports = {
    create,
    getAll,
    getById,
    remove
};
