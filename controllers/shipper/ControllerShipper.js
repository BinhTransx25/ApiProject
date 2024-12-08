const ModelShipper = require('../shipper/ModelShipper');
const Shipper = require('../shipper/ModelShipper');
const ModelUser = require('../users/ModelUser');
const ModelOrder = require('../order/ModelOrder');
const ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcryptjs');

// thêm shipper mới
const addShipper = async (name, phone, email, address, role, rating,
    image, password, gender, birthDate, vehicleBrand, vehiclePlate,
    verified, imageVerified) => {
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
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        const newShipper = new Shipper({
            name, phone, email, address, role, rating,
            image, password, gender, birthDate, vehicleBrand, vehiclePlate, verified, imageVerified
        });
        return await newShipper.save();
    } catch (error) {
        if (error.code === 11000) {
            // Xử lý lỗi MongoDB duplicate key
            console.error("Lỗi: Email đã được sử dụng");
            throw new Error("Email đã được sử dụng");
        } else {
            console.error("Lỗi khi thêm shipper:", error);
            throw new Error("Lỗi khi thêm shipper");
        }
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
        const shipper = await ModelShipper.findById(id, 'name phone email address rating image gender birthDate vehicleBrand vehiclePlate status verified imageVerified isDeleted')

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
const updateShipper = async (id, name, phone, email, address, image, password, gender, birthDate, vehicleBrand, vehiclePlate, imageVerified) => {
    try {

        const shipperInDB = await ModelShipper.findById(id);
        if (!shipperInDB) {
            throw new Error('Không Tìm Thấy Shipper, Hãy thử lại');
        }
        shipperInDB.name = name || shipperInDB.name;
        shipperInDB.phone = phone || shipperInDB.phone;
        shipperInDB.email = email || shipperInDB.email;
        shipperInDB.address = address || shipperInDB.address;
        shipperInDB.image = image || shipperInDB.image;
        shipperInDB.password = password || shipperInDB.password;
        shipperInDB.gender = gender || shipperInDB.gender;
        shipperInDB.birthDate = birthDate || shipperInDB.birthDate;
        shipperInDB.vehicleBrand = vehicleBrand || shipperInDB.vehicleBrand;
        shipperInDB.vehiclePlate = vehiclePlate || shipperInDB.vehiclePlate;
        // Xử lý cập nhật imageVerified
        if (imageVerified) {
            if (Array.isArray(imageVerified)) {
                // Nếu imageVerified là mảng, cập nhật trực tiếp
                shipperInDB.imageVerified = imageVerified;
            } else {
                // Nếu imageVerified là chuỗi, chuyển thành mảng
                shipperInDB.imageVerified = [imageVerified];
            }
        }

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
            { status: 'Hoạt động', updated_at: Date.now() },
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
            { status: 'Tài khoản bị khóa', updated_at: Date.now() },
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
const confirmOrderShipperExists = async (orderId, shipperId, io) => {
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

        // Tìm thông tin shipper theo ID
        const shipper = await ModelShipper.findById(shipperId);
        if (!shipper) {
            throw new Error('Shipper not found');
        }

        // Kiểm tra xem đơn hàng đã có shipper chưa
        if (!order.shipper) {
            // Nếu chưa có shipper, gán object shipper vào đơn hàng và cập nhật trạng thái
            order.shipper = {
                _id: shipper._id,
                name: shipper.name,
                phone: shipper.phone,
                image: shipper.image,
            };
            order.status = 'Tài xế đang đến nhà hàng';
            await order.save();

            // Phát sự kiện cho socket
            if (io) {
                io.emit('order_assigned', { orderId, shipperId, status: order.status });
                io.emit('order_status', { order, status: order.status });
                console.log(`Socket emitted for order ${orderId} assigned to shipper ${shipperId}`);
            }
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

// shipper đã đến nhà hàng 
const confirmShipperArrivedShopOwner = async (orderId, shipperId, io) => {
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
            order.status = 'Tài xế đã đến nhà hàng';
            await order.save();

            // Phát sự kiện cho socket
            if (io) {
                io.emit('order_completed', { orderId, status: order.status });
                io.emit('order_status', { order, status: order.status });
                console.log(`Socket emitted for order ${orderId} completed by shipper ${shipperId}`);
            }
            return order; // Trả về đơn hàng đã cập nhật
        }
    } catch (error) {
        console.error('Error confirming order by shipper ID:', error);
        throw new Error('Error confirming order by shipper ID');
    }
};
// shipper đang giao hàng
const confirmShipperOnDelivery = async (orderId, shipperId, io) => {
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
            order.status = 'Đang giao hàng';
            await order.save();

            // Phát sự kiện cho socket
            if (io) {
                io.emit('order_completed', { orderId, status: order.status });
                io.emit('order_status', { order, status: order.status });
                console.log(`Socket emitted for order ${orderId} completed by shipper ${shipperId}`);
            }
            return order; // Trả về đơn hàng đã cập nhật
        }
    } catch (error) {
        console.error('Error confirming order by shipper ID:', error);
        throw new Error('Error confirming order by shipper ID');
    }
};

// shipper đã đến điểm giao hàng
const confirmShipperArrivedDeliveryPoint = async (orderId, shipperId, io) => {
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
            order.status = 'Shipper đã đến điểm giao hàng';
            await order.save();

            // Phát sự kiện cho socket
            if (io) {
                io.emit('order_completed', { orderId, status: order.status });
                io.emit('order_status', { order, status: order.status });
                console.log(`Socket emitted for order ${orderId} completed by shipper ${shipperId}`);
            }
            return order; // Trả về đơn hàng đã cập nhật
        }
    } catch (error) {
        console.error('Error confirming order by shipper ID:', error);
        throw new Error('Error confirming order by shipper ID');
    }
};

/**
 * Xác nhận đơn hàng bởi shipper (kiểm tra ID của shipper).
 * @param {String} orderId - ID của đơn hàng.
 * @param {String} shipperId - ID của shipper.
 * @returns {Object} - Đơn hàng đã được cập nhật hoặc thông báo.
 */
const confirmOrderByShipperId = async (orderId, shipperId, io) => {
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

            // Phát sự kiện cho socket
            if (io) {
                io.emit('order_completed', { orderId, status: order.status });
                io.emit('order_status', { order, status: order.status });
                console.log(`Socket emitted for order ${orderId} completed by shipper ${shipperId}`);
            }
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
const cancelOrderByShipperId = async (orderId, shipperId, reason, io) => {
    console.log('Confirming order with ID:', orderId, 'by shipper with ID:', shipperId, 'Reason:', reason);

    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Kiểm tra ID của shipper có đúng trong đơn hàng hay không
        if (order.shipper._id && order.shipper._id.toString() === shipperId) {
            // Cập nhật trạng thái và lý do hủy của shipper
            order.status = 'Shipper đã hủy đơn';
            order.reasonCancel = reason; // Lưu lý do hủy
            await order.save();

            // Phát sự kiện cho socket
            if (io) {
                io.emit('order_cancelled', { orderId, status: order.status, reason });
                io.emit('order_status', { order, status: order.status, reason });
                console.log(`Socket emitted for order ${orderId} cancelled by shipper ${shipperId} with reason: ${reason}`);
            }

            return order; // Trả về đơn hàng đã cập nhật
        } else {
            throw new Error('ID của shipper không đúng hoặc đơn hàng chưa có shipper');
        }
    } catch (error) {
        console.error('Error confirming order by shipper ID:', error);
        throw new Error('Error confirming order by shipper ID');
    }
};

const getRevenueByShipper = async (shipperId, date, filter) => {
    try {
        // Chuyển `shipperId` thành ObjectId nếu cần thiết
        const shipperObjectId = new ObjectId(shipperId);

        // Khai báo biến để lưu trữ khoảng thời gian bắt đầu và kết thúc
        let startDate, endDate;

        // Xác định khoảng thời gian dựa trên giá trị của `filter`
        if (filter === 'day') {
            // Nếu filter là 'day', lấy đầu ngày và cuối ngày
            startDate = new Date(new Date(date).setUTCHours(0, 0, 0, 0)); // Thời điểm bắt đầu ngày
            endDate = new Date(new Date(date).setUTCHours(23, 59, 59, 999)); // Thời điểm kết thúc ngày
        } else if (filter === 'week') {
            // Nếu filter là 'week', lấy ngày đầu tuần (Chủ nhật) và cuối tuần (Thứ Bảy)
            const startOfWeek = new Date(date);
            // Lấy ngày Chủ nhật của tuần đó
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getUTCDay());
            startDate = new Date(startOfWeek.setUTCHours(0, 0, 0, 0)); // Thời điểm bắt đầu tuần

            // Tạo một đối tượng Date mới từ startOfWeek để tính ngày Thứ Bảy
            endDate = new Date(startOfWeek); // Tạo một đối tượng Date mới từ startOfWeek
            endDate.setDate(endDate.getDate() + 6); // Cộng thêm 6 ngày để có ngày Thứ Bảy
            endDate.setUTCHours(23, 59, 59, 999); // Thiết lập giờ cho endDate
        } else if (filter === 'month') {
            // Nếu filter là 'month', lấy ngày đầu và cuối tháng
            const startOfMonth = new Date(date);
            // Thời điểm bắt đầu tháng
            startDate = new Date(startOfMonth.getUTCFullYear(), startOfMonth.getUTCMonth(), 1, 0, 0, 0, 0);
            // Thời điểm kết thúc tháng
            endDate = new Date(startOfMonth.getUTCFullYear(), startOfMonth.getUTCMonth() + 1, 0, 23, 59, 59, 999);
        } else {
            // Nếu filter không hợp lệ, ném ra lỗi
            throw new Error("Filter không hợp lệ. Chỉ chấp nhận 'day', 'week', 'month'.");
        }

        // Tìm các đơn hàng của shipper trong khoảng thời gian xác định và chưa bị xóa
        const orders = await ModelOrder.find({
            'shipper._id': shipperObjectId, // Lọc theo shipperId
            orderDate: { $gte: startDate, $lte: endDate }, // Lọc theo ngày đặt hàng
            isDeleted: false, // Chỉ lấy các order chưa bị xóa
            status: {
                $nin: [
                    'Đang xử lý',
                    'Chờ thanh toán',
                    'Nhà hàng hủy đơn',
                    'Tài xế hủy đơn',
                    'Khách hủy đơn',
                    'Đơn hàng tạm xóa'
                ]
            } // Loại trừ những trạng thái không mong muốn
        }).sort({ orderDate: -1 });

        // Tính toán các giá trị tổng hợp
        const totalOrders = orders.length; // Tổng số đơn hàng
        let cashTotal = 0; // Tổng doanh thu bằng tiền mặt
        let appTotal = 0; // Tổng doanh thu qua ứng dụng

        // Duyệt qua từng đơn hàng để tính doanh thu
        orders.forEach(order => {
            if (order.paymentMethod === 'Tiền mặt') {
                cashTotal += order.shippingfee; // Cộng doanh thu từ đơn hàng thanh toán bằng tiền mặt
            } else {
                appTotal += order.shippingfee; // Cộng doanh thu từ đơn hàng thanh toán qua ứng dụng
            }
        });

        // Tính tổng doanh thu
        const totalRevenue = cashTotal + appTotal;

        // Trả về kết quả
        return {
            startDate: startDate, // Ngày bắt đầu
            endDate: endDate, // Ngày kết thúc
            totalOrders: totalOrders, // Tổng số đơn hàng
            totalRevenue: totalRevenue, // Tổng doanh thu
            cashTotal: cashTotal, // Tổng doanh thu bằng tiền mặt
            appTotal: appTotal, // Tổng doanh thu qua ứng dụng
            orders: orders // Danh sách đơn hàng
        };
    } catch (error) {
        // Ghi log lỗi nếu có
        console.error('Lỗi khi lấy doanh thu của shipper:', error);
        // Ném ra lỗi cho hàm gọi
        throw new Error('Lỗi khi lấy doanh thu của shipper');
    }
};


const getRevenueByShipperCustomRange = async (shipperId, startDateInput, endDateInput) => {
    try {
        // Chuyển `shipperId` thành ObjectId nếu cần thiết
        const shipperObjectId = new ObjectId(shipperId);

        // Kiểm tra và chuyển đổi ngày nhập vào thành đối tượng Date
        const startDate = new Date(startDateInput);
        const endDate = new Date(endDateInput);

        // Kiểm tra tính hợp lệ của khoảng thời gian
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error("Ngày không hợp lệ. Vui lòng nhập ngày theo định dạng hợp lệ (yyyy-mm-dd).");
        }

        // Đảm bảo `endDate` luôn là cuối ngày
        endDate.setUTCHours(23, 59, 59, 999);

        // Tìm các đơn hàng của shipper trong khoảng thời gian xác định và chưa bị xóa
        const orders = await ModelOrder.find({
            'shipper._id': shipperObjectId, // Lọc theo shipperId
            orderDate: { $gte: startDate, $lte: endDate }, // Lọc theo ngày đặt hàng
            isDeleted: false, // Chỉ lấy các order chưa bị xóa
            status: {
                $nin: [
                    'Đang xử lý',
                    'Chờ thanh toán',
                    'Nhà hàng hủy đơn',
                    'Tài xế hủy đơn',
                    'Khách hủy đơn',
                    'Đơn hàng tạm xóa'
                ]
            } // Loại trừ những trạng thái không mong muốn
        }).sort({ orderDate: -1 });

        // Tính toán các giá trị tổng hợp
        const totalOrders = orders.length; // Tổng số đơn hàng
        let cashTotal = 0; // Tổng doanh thu bằng tiền mặt
        let appTotal = 0; // Tổng doanh thu qua ứng dụng

        // Duyệt qua từng đơn hàng để tính doanh thu
        orders.forEach(order => {
            if (order.paymentMethod === 'Tiền mặt') {
                cashTotal += order.shippingfee; // Cộng doanh thu từ đơn hàng thanh toán bằng tiền mặt
            } else {
                appTotal += order.shippingfee; // Cộng doanh thu từ đơn hàng thanh toán qua ứng dụng
            }
        });

        // Tính tổng doanh thu
        const totalRevenue = cashTotal + appTotal;

        // Trả về kết quả
        return {
            startDate: startDate, // Ngày bắt đầu
            endDate: endDate, // Ngày kết thúc
            totalOrders: totalOrders, // Tổng số đơn hàng
            totalRevenue: totalRevenue, // Tổng doanh thu
            cashTotal: cashTotal, // Tổng doanh thu bằng tiền mặt
            appTotal: appTotal, // Tổng doanh thu qua ứng dụng
            orders: orders // Danh sách đơn hàng
        };
    } catch (error) {
        // Ghi log lỗi nếu có
        console.error('Lỗi khi lấy doanh thu của shipper:', error);
        // Ném ra lỗi cho hàm gọi
        throw new Error('Lỗi khi lấy doanh thu của shipper');
    }
};

const changePassword = async (email, oldPassword, newPassword) => {
    try {
        // Tìm admin theo email
        const shipperInDB = await ModelShipper.findOne({ email });
        if (!shipperInDB) {
            throw new Error('Email không tồn tại');
        }

        // Kiểm tra mật khẩu cũ
        if (shipperInDB.password) {
            // Nếu mật khẩu đã được băm
            const checkPassword = await bcrypt.compare(oldPassword, shipperInDB.password);
            if (!checkPassword) {
                throw new Error('Tài khoản hoặc mật khẩu không đúng');
            }
        }

        // Băm mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        shipperInDB.password = await bcrypt.hash(newPassword, salt);

        // Lưu mật khẩu mới vào cơ sở dữ liệu
        await shipperInDB.save();

        return { message: 'Password changed successfully' };
    } catch (error) {
        console.error('Error changing password:', error);
        throw new Error('Error changing password');
    }
};

//  Xác thực shipper
const changeShipperVerified = async (id) => {
    try {
        // Lấy thông tin shipper theo ID
        const shipper = await Shipper.findById(id);

        if (!shipper) {
            throw new Error('Không tìm thấy shipper');
        }

        // Kiểm tra nếu cột imageVerified không có hình ảnh thì từ chối cập nhật
        if (!shipper.imageVerified || shipper.imageVerified.length === 0) {
            throw new Error('Không thể xác thực shipper vì chưa có hình ảnh xác thực');
        }

        // Cập nhật cột verified thành true và status thành active
        return await Shipper.findByIdAndUpdate(
            id,
            { verified: true, updated_at: Date.now() },
            { new: true }
        );
    } catch (error) {
        console.error('Thay đổi xác thực thất bại', error);
        throw new Error(error.message || 'Lỗi khi xác thực shipper');
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
    cancelOrderByShipperId,
    getRevenueByShipper,
    changePassword,
    confirmShipperArrivedShopOwner,
    confirmShipperOnDelivery,
    confirmShipperArrivedDeliveryPoint,
    changeShipperVerified,
    getRevenueByShipperCustomRange

};
