const ModelShipper = require('../shipper/ModelShipper');
const Shipper = require('../shipper/ModelShipper');
const ModelUser = require('../users/ModelUser');
const ModelOrder = require('../order/ModelOrder')

// Thêm shipper mới
const addShipper = async (name, phone, email, address, role, rating, image, password, gender, birthDate, vehicleBrand, vehiclePlate) => {
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


        const newShipper = new Shipper({ name, phone, email, address,role, rating, image, password, gender, birthDate, vehicleBrand, vehiclePlate });
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
        const shipper = await ModelShipper.findById(id,'name phone email address rating image gender birthDate vehicleBrand vehiclePlate')

        if (!shipper) {
            throw new Error('Shipper not found');
        }
        return shipper;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin shipper theo ID:', error);
        throw new Error('Lỗi khi lấy thông tin shipper theo ID');
    }
};



// Cập nhật thông tin shipper
const updateShipper = async (id, name, phone, email, address, image, password, gender, birthDate, vehicleBrand, vehiclePlate) => {
    try {

        const shipperInDB = await ModelShipper.findById(id);
        if (!shipperInDB) {
            throw new Error('Không Tìm Thấy Shipper, Hãy thử lại');
        }
        shipperInDB.name = name || shipperInDB.name ;
        shipperInDB.phone = phone || shipperInDB.phone ;
        shipperInDB.email = email || shipperInDB.email ;
        shipperInDB.address = address || shipperInDB.address ;
        shipperInDB.image = image || shipperInDB.image ;
        shipperInDB.password = password || shipperInDB.password ;
        shipperInDB.gender = gender || shipperInDB.gender ;
        shipperInDB.birthDate = birthDate || shipperInDB.birthDate ;
        shipperInDB.vehicleBrand = vehicleBrand || shipperInDB.vehicleBrand ;
        shipperInDB.vehiclePlate = vehiclePlate || shipperInDB.vehiclePlate ;

        let result = await shipperInDB.save();
        return result;
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

// Mở Trạng thái hoạt động của shipper
const changeShipperStatusActive = async (id) => {
    try {
        return await Shipper.findByIdAndUpdate(
            id,
            { status: 'active', updated_at: Date.now() },
            { new: true }
        );
    } catch (error) {
        console.error('Thay đổi trạng thái thất bại', error);
        throw new Error('Lỗi khi xác nhận shipper');
    }
};

// Tắt Trạng thái hoạt động của shipper
const changeShipperStatusUnActive = async (id) => {
    try {
        return await Shipper.findByIdAndUpdate(
            id,
            { status: 'unactive', updated_at: Date.now() },
            { new: true }
        );
    } catch (error) {
        console.error('Thay đổi trạng thái thất bại', error);
        throw new Error('Lỗi khi hủy shipper');
    }
};


/**
 * Xác nhận đơn hàng bởi shipper (kiểm tra có shipper hay không).
 * @param {String} orderId - ID của đơn hàng.
 * @param {String} shipperId - ID của shipper.
 * @returns {Object} - Đơn hàng đã được cập nhật hoặc thông báo.
 */
const confirmOrderShipperExists = async (orderId, shipperId) => {
    console.log('Checking order with ID:', orderId, 'for shipper with ID:', shipperId);
    try {
        // Kiểm tra xem shipperId có được cung cấp không
        if (!shipperId) {
            throw new Error('Shipper ID is required');
        }

        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Kiểm tra xem đơn hàng đã có shipper chưa
        if (!order.shipper) {
            // Nếu chưa có shipper, gán shipperId và cập nhật trạng thái thành "Đang giao hàng"
            order.shipper = shipperId;
            order.status = 'Đang giao hàng';
            await order.save();
            return order; // Trả về đơn hàng đã cập nhật
        } else {
            // Nếu đã có shipper
            return { message: 'Đơn hàng đã có shipper vận chuyển, hãy đợi đơn hàng khác' };
        }
    } catch (error) {
        console.error('Error checking order for shipper:', error);
        throw new Error('Error checking order for shipper');
    }
};

/**
 * Xác nhận đơn hàng bởi shipper (kiểm tra ID của shipper).
 * @param {String} orderId - ID của đơn hàng.
 * @param {String} shipperId - ID của shipper.
 * @returns {Object} - Đơn hàng đã được cập nhật hoặc thông báo.
 */
const confirmOrderByShipperId = async (orderId, shipperId) => {
    console.log('Confirming order with ID:', orderId, 'by shipper with ID:', shipperId);
    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        // Kiểm tra ID của shipper có đúng trong đơn hàng hay không
        if (order.shipper._id && order.shipper._id.toString() === shipperId) {
            // Cập nhật trạng thái thành "Đơn hàng đã được giao hoàn tất"
            order.status = 'Đơn hàng đã được giao hoàn tất';
            await order.save();
            return order; // Trả về đơn hàng đã cập nhật
        } else {
            throw new Error('ID của shipper không đúng hoặc đơn hàng chưa có shipper');
        }
    } catch (error) {
        console.error('Error confirming order by shipper ID:', error);
        throw new Error('Error confirming order by shipper ID');
    }
};

/**
 * Hủy đơn hàng bởi shipper (kiểm tra ID của shipper).
 * @param {String} orderId - ID của đơn hàng.
 * @param {String} shipperId - ID của shipper.
 * @returns {Object} - Đơn hàng đã được cập nhật hoặc thông báo.
 */
const cancelOrderByShipperId = async (orderId, shipperId) => {
    console.log('Confirming order with ID:', orderId, 'by shipper with ID:', shipperId);
    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        // Kiểm tra ID của shipper có đúng trong đơn hàng hay không
        if (order.shipper._id && order.shipper._id.toString() === shipperId) {
            // Cập nhật trạng thái thành "Đơn hàng đã được giao hoàn tất"
            order.status = 'Shipper đã hủy đơn';
            await order.save();
            return order; // Trả về đơn hàng đã cập nhật
        } else {
            throw new Error('ID của shipper không đúng hoặc đơn hàng chưa có shipper');
        }
    } catch (error) {
        console.error('Error confirming order by shipper ID:', error);
        throw new Error('Error confirming order by shipper ID');
    }
};

module.exports = {
    addShipper,
    getAllShippers,
    getShipperById,
    updateShipper,
    deleteShipper,
    changeShipperStatusActive,
    changeShipperStatusUnActive,
    confirmOrderShipperExists,
    confirmOrderByShipperId,
    cancelOrderByShipperId
};
