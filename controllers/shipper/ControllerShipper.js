const Shipper = require('../shipper/ModelShipper');
const ModelUser = require('../users/ModelUser');

// Thêm shipper mới
const addShipper = async (name, phone, email, address, role, rating, image, password) => {
    try {
        // Kiểm tra email đã tồn tại trong hệ thống hay chưa
        let user = await ModelUser.findOne({ email });
        if (user) {
            throw new Error('Email đã được sử dụng');
        }
        // Kiểm tra email đã tồn tại trong hệ thống hay chưa
        let shopOwner = await ModelUser.findOne({ email });
        if (shopOwner) {
            throw new Error('Email đã được sử dụng');
        }


        const newShipper = new Shipper({ name, phone, email, address,role, rating, image, password });
        return await newShipper.save();
    } catch (error) {
        console.error('Lỗi khi thêm shipper:', error);
        throw new Error('Lỗi khi thêm shipper');
    }
};

// Lấy thông tin tất cả các shipper
const getAllShippers = async () => {
    try {
        return await Shipper.find();
    } catch (error) {
        console.error('Lỗi khi lấy thông tin tất cả các shipper:', error);
        throw new Error('Lỗi khi lấy thông tin tất cả các shipper');
    }
};

// Lấy thông tin shipper theo ID
const getShipperById = async (id) => {
    try {
        return await Shipper.findById(id).populate('assignedOrders');
    } catch (error) {
        console.error('Lỗi khi lấy thông tin shipper theo ID:', error);
        throw new Error('Lỗi khi lấy thông tin shipper theo ID');
    }
};

// Cập nhật thông tin shipper
const updateShipper = async (id, updateData) => {
    try {
        updateData.updated_at = Date.now();
        return await Shipper.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin shipper:', error);
        throw new Error('Lỗi khi cập nhật thông tin shipper');
    }
};

// Xóa shipper
const deleteShipper = async (id) => {
    try {
        return await Shipper.findByIdAndDelete(id);
    } catch (error) {
        console.error('Lỗi khi xóa shipper:', error);
        throw new Error('Lỗi khi xóa shipper');
    }
};

// Cập nhật vị trí hiện tại của shipper
const updateShipperLocation = async (id, coordinates) => {
    try {
        return await Shipper.findByIdAndUpdate(
            id,
            { currentLocation: { type: 'Point', coordinates }, updated_at: Date.now() },
            { new: true }
        );
    } catch (error) {
        console.error('Lỗi khi cập nhật vị trí shipper:', error);
        throw new Error('Lỗi khi cập nhật vị trí shipper');
    }
};

// Xác nhận shipper
const confirmShipper = async (id) => {
    try {
        return await Shipper.findByIdAndUpdate(
            id,
            { status: 'active', updated_at: Date.now() },
            { new: true }
        );
    } catch (error) {
        console.error('Lỗi khi xác nhận shipper:', error);
        throw new Error('Lỗi khi xác nhận shipper');
    }
};

// Hủy shipper
const cancelShipper = async (id) => {
    try {
        return await Shipper.findByIdAndUpdate(
            id,
            { status: 'inactive', updated_at: Date.now() },
            { new: true }
        );
    } catch (error) {
        console.error('Lỗi khi hủy shipper:', error);
        throw new Error('Lỗi khi hủy shipper');
    }
};


/**
 * Xác nhận đơn hàng bởi shipper.
 * @param {String} orderId - ID của đơn hàng.
 * @param {String} shipperId - ID của shipper.
 * @returns {Object} - Đơn hàng đã được cập nhật với thông tin shipper.
 */
const confirmOrderByShipper = async (orderId, shipperId) => {
    console.log('Confirming order with ID:', orderId, 'by shipper with ID:', shipperId);

    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // sau khi shop đã xác nhận đơn hàng
        // Kiểm tra xem đơn hàng đã có shipper chưa
        if (!order.shipperId) {
            // Nếu chưa có shipper, gán shipperId và cập nhật trạng thái thành "processing" là nhấn cái đầu tiên 
            order.shipperId = shipperId;
            order.status = 'processing';
        } else if (order.shipperId.toString() === shipperId && order.status === 'processing') {
            // Nếu đơn hàng đã ở trạng thái "processing" và shipper xác nhận lần nữa, cập nhật trạng thái thành "completed" là nhấn cái thứ hai 
            order.status = 'completed';
        } else {
            throw new Error('Order has already been processed or completed by another shipper');
        }

        await order.save();

        // Tìm User có chứa đơn hàng này trong carts và cập nhật trạng thái
        const user = await ModelUser.findOne({ 'carts._id': orderId });
        if (user) {
            const cartItem = user.carts.id(orderId);  // Lấy item trong carts có ID của order
            console.log('itemmmmmmmmmm:', cartItem);
            if (cartItem) {
                cartItem.status = order.status; // Cập nhật trạng thái trong carts dựa trên trạng thái của order
                await user.save(); // Lưu lại user với trạng thái đã cập nhật
            }
        }

        return order; // Trả về đơn hàng đã cập nhật
    } catch (error) {
        console.error('Error confirming order by shipper:', error);
        throw new Error('Error confirming order by shipper');
    }
};


module.exports = {
    addShipper,
    getAllShippers,
    getShipperById,
    updateShipper,
    deleteShipper,
    updateShipperLocation,
    confirmShipper,
    cancelShipper,
    confirmOrderByShipper
};
