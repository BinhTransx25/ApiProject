const ModelOrder = require('./ModelOrder');
const ModelUser = require('../users/ModelUser');
const ModelAddress = require('../address/User/ModelAddressUser');
const ModelShopOwner = require('../shopowner/ModelShopOwner');
const ModelShipper = require('../shipper/ModelShipper');
const ModelVoucher = require('../vouchers/ModelVouher');
const ModelProduct = require('../products/ModelProduct')
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Thêm đơn hàng mới.
 * @param {String} userId - ID của người dùng.
 * @param {Array} order - Danh sách sản phẩm trong đơn hàng.
 * @param {String} shippingAddressId - ID của địa chỉ giao hàng.
 * @param {String} paymentMethod - Phương thức thanh toán.
 * @param {String} shopOwnerId - ID của chủ cửa hàng.
 * @returns {Array} - Danh sách carts đã được cập nhật của người dùng.
 */
const addOrder = async (userId, order, paymentMethod, shopOwnerId, totalPrice, shipperId, io,
    voucherId, shippingfee, distance, recipientName, address, latitude, longitude, phone, label,
    reasonCancel) => {
    console.log("Adding order with data:", { userId, order, paymentMethod, shopOwnerId, shipperId });

    if (!userId || !order || !paymentMethod || !shopOwnerId) {
        throw new Error('Missing required fields in request body');
    }

    try {
        let errors = {};
        // Tìm người dùng, nhà hàng, và shipper
        const user = await ModelUser.findById(userId);
        if (!user) throw new Error('User not found');

        const shopOwner = await ModelShopOwner.findById(shopOwnerId);
        if (!shopOwner) throw new Error('Shop owner not found');

        // Kiểm tra trạng thái của nhà hàng
        if (shopOwner.status !== "Mở cửa") {
            errors = { shopId: shopOwner._id, status: shopOwner.status };
            return { errors }

        }

        // Kiểm tra trạng thái của từng sản phẩm
        for (const item of order) {

            const productObjId = new ObjectId(item._id);
            const product = await ModelProduct.findById(productObjId);
            if (!product) {
                throw new Error(`Sản phẩm với ID ${item._id} không tồn tại`);
            }
            if (product.status !== "Còn món") {
                errors = { product_id: product._id, status: product.status };
                return { errors }
            }
        }

        // Xử lý thông tin shipper nếu có shipperId
        let shipper;
        if (shipperId) {
            shipper = await ModelShipper.findById(shipperId);
            if (!shipper) throw new Error('Shipper not found');
        }

        let voucher;
        if (voucherId) {
            voucher = await ModelVoucher.findById(voucherId);
            if (!voucher) throw new Error('Voucher not found');
        }

        // Tạo đơn hàng mới
        const newOrder = new ModelOrder({
            items: order.map(item => ({
                _id: item._id,
                name: item.name,
                images: item.images,
                note: item.note,
                price: item.price,
                quantity: item.quantity,
            })),
            shippingAddress: {
                recipientName,
                address,
                latitude,
                longitude,
                phone,
                label,
                userId,
            },
            paymentMethod,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                image: user.image,
            },
            shopOwner: {
                _id: shopOwner._id,
                name: shopOwner.name,
                address: shopOwner.address,
                images: shopOwner.images,
                rating: shopOwner.rating,
                latitude: shopOwner.latitude,
                longitude: shopOwner.longitude,
            },
            totalPrice,
            shipper: shipper ? {
                _id: shipper._id,
                name: shipper.name,
                phone: shipper.phone,
            } : null,
            voucher: voucher ? {
                _id: voucher._id,
                code: voucher.code,
                discountAmount: voucher.discountAmount,
                minimumOrderAmount: voucher.minimumOrderAmount,
                expirationDate: voucher.expirationDate
            } : null,
            shippingfee,
            distance,
            reasonCancel
        });

        let result = await newOrder.save();

        // Thêm đơn hàng mới vào danh sách của người dùng
        user.orders.push(newOrder);
        await user.save();

        // Cập nhật `soldOut` cho các sản phẩm trong đơn hàng
        for (const item of order) {
            await ModelProduct.findByIdAndUpdate(
                item._id,
                { $inc: { soldOut: item.quantity } }, // Tăng `soldOut` theo số lượng đã đặt
                { new: true }
            );
        }

        // Chỉ gửi socket nếu đơn hàng không ở trạng thái "Chờ thanh toán"
        if (newOrder.status !== 'Chờ thanh toán') {
            // Gửi thông báo đến cửa hàng liên quan
            io.to(String(shopOwner._id)).emit('new_order_created', { orderId: newOrder._id, order: newOrder });
            console.log(`New order created for shop owner ${shopOwner._id}: ${newOrder._id}`);
        } else {
            console.log(`Order ${newOrder._id} is pending payment, no socket emitted.`);
        }


        return result; // Trả về danh sách đơn hàng của người dùng
    } catch (error) {
        console.error("Error when adding order:", error);
        throw error;
    }
};


/**
 * Lấy chi tiết đơn hàng theo orderId.
 * @param {String} orderId - ID của đơn hàng.
 * @returns {Object} - Chi tiết đơn hàng.
 */
const getOrderDetail = async (orderId) => {
    try {
        const order = await ModelOrder.findById(orderId)

        if (!order) throw new Error('Order not found');
        return order;
    } catch (error) {
        console.error('Error when getting order detail:', error);
        throw new Error('Error when getting order detail');
    }
};

/**
 * Lấy danh sách đơn hàng theo shopId.
 * @param {String} shopId - ID của chủ cửa hàng.
 * @returns {Array} - Danh sách đơn hàng.
 */
const getOrdersByShop = async (shopId) => {
    try {
        const objectIdShopId = new mongoose.Types.ObjectId(shopId); // Chuyển đổi shopId thành ObjectId
        const orders = await ModelOrder.find({ 'shopOwner._id': objectIdShopId }); // Truy vấn bằng ObjectId
        console.log('Orders', orders);
        console.log('shopId:', shopId);
        console.log('objectIdShopId:', objectIdShopId);
        return orders;
    } catch (error) {
        console.error('Error when getting orders:', error);
        throw new Error('Error when getting orders');
    }
};
/**
 * Lấy danh sách đơn hàng theo shopId.
 * @param {String} shipperId - ID của chủ shipper.
 * @returns {Array} - Danh sách đơn hàng.
 */
const getOrdersByShipper = async (shipperId) => {
    try {
        const objectIdShipperId = new mongoose.Types.ObjectId(shipperId); // Chuyển đổi shopId thành ObjectId
        const orders = await ModelOrder.find({ 'shipper._id': objectIdShipperId }); // Truy vấn bằng ObjectId
        console.log('Orders', orders);
        console.log('shipperId:', shipperId);
        console.log('objectIdShipperId:', objectIdShipperId);
        return orders;
    } catch (error) {
        console.error('Error when getting orders:', error);
        throw new Error('Error when getting orders');
    }
};
/**
 * Lấy danh sách đơn hàng theo shopId.
 * @param {String} userId - ID của chủ shipper.
 * @returns {Array} - Danh sách đơn hàng.
 */
const getOrdersByUser = async (userId) => {
    try {
        const objectIdUserId = new mongoose.Types.ObjectId(userId); // Chuyển đổi shopId thành ObjectId
        const orders = await ModelOrder.find({ 'user._id': objectIdUserId }).sort({ updatedAt: -1 }); // Truy vấn bằng ObjectId
        console.log('Orders', orders);
        console.log('userId:', userId);
        console.log('objectIdUserId:', objectIdUserId);
        return orders;
    } catch (error) {
        console.error('Error when getting orders:', error);
        throw new Error('Error when getting orders');
    }
};

/**
 * Xác nhận đơn hàng theo orderId.
 * @param {String} orderId - ID của đơn hàng.
 * @param {String} shipperId - ID của shipper.
 * @returns {Object} - Đơn hàng đã được xác nhận.
 */
// Hàm confirmOrder với socket.io, Cho shopOwner bấm
const confirmOrder = async (orderId, io) => {
    console.log('Confirming order with ID:', orderId); // Log kiểm tra orderId

    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật trạng thái của đơn hàng thành "Tìm tài xế"
        order.status = 'Tìm tài xế';
        await order.save();

        // Tìm User có chứa đơn hàng này trong orders và cập nhật trạng thái
        const user = await ModelUser.findOne({ 'orders._id': orderId });
        if (user) {
            const orderItem = user.orders.id(orderId); // Lấy đơn hàng trong orders có ID của order
            if (orderItem) {
                orderItem.status = 'Tìm tài xế'; // Cập nhật trạng thái trong orders
                await user.save(); // Lưu lại user với trạng thái đã cập nhật
            }
        }

        // Phát sự kiện tới tất cả các shipper nếu io tồn tại
        if (io) {
            io.emit('order_confirmed', { order, status: 'Tìm tài xế' });
            io.emit('order_status', { order, status: 'Tìm tài xế' });
            console.log(`Socket emitted for order ${orderId} with status 'Tìm tài xế'`);
        } else {
            console.warn('Socket.io instance not found, cannot emit event');
        }

        return order; // Trả về đơn hàng đã cập nhật
    } catch (error) {
        console.error('Error confirming order:', error);
        throw new Error('Error confirming order');
    }
};

/**
 * Hủy đơn hàng theo orderId.
 * @param {String} orderId - ID của đơn hàng.
 * @returns {Object} - Đơn hàng đã bị hủy.
 */
// Cho ShopOwner Bấm
const shopOwnerCancelOrder = async (orderId, reason, io) => {
    console.log('Cancelling order with ID:', orderId, 'Reason:', reason); // Log kiểm tra

    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật trạng thái và lý do hủy
        order.status = 'Nhà hàng đã hủy đơn';
        order.reasonCancel = reason; // Lưu lý do hủy
        await order.save();

        // Tìm User có chứa đơn hàng này trong orders và cập nhật trạng thái
        const user = await ModelUser.findOne({ 'orders._id': orderId });
        if (user) {
            const orderItem = user.orders.id(orderId); // Lấy đơn hàng trong orders có ID của order
            if (orderItem) {
                orderItem.status = 'Nhà hàng đã hủy đơn'; // Cập nhật trạng thái trong orders
                await user.save(); // Lưu lại user với trạng thái đã cập nhật
            }
        }

        // Phát sự kiện qua socket
        if (io) {
            io.emit('order_cancelled', { orderId, status: 'Nhà hàng hủy đơn', reason });
            io.emit('order_status', { order, status: 'Nhà hàng hủy đơn', reason });
            console.log(`Socket emitted for order ${orderId} with status 'Nhà hàng hủy đơn' and reason: ${reason}`);
        } else {
            console.warn('Socket.io instance not found, cannot emit event');
        }

        return order; // Trả về đơn hàng đã cập nhật
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw new Error('Error cancelling order');
    }
};

/**
 * Hủy đơn hàng theo orderId.
 * @param {String} orderId - ID của đơn hàng.
 * @returns {Object} - Đơn hàng đã bị hủy.
 */

// Người Dùng Bấm 
const CustomerCancelOrder = async (orderId, io) => {
    console.log('Cancelling order with ID:', orderId); // Log kiểm tra orderId

    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật trạng thái của đơn hàng thành "Người dùng đã hủy đơn"
        order.status = 'Người dùng đã hủy đơn';
        await order.save();

        // Tìm User có chứa đơn hàng này trong orders và cập nhật trạng thái
        const user = await ModelUser.findOne({ 'orders._id': orderId });
        if (user) {
            const orderItem = user.orders.id(orderId); // Lấy đơn hàng trong orders có ID của order
            if (orderItem) {
                orderItem.status = 'Người dùng đã hủy đơn'; // Cập nhật trạng thái trong orders
                await user.save(); // Lưu lại user với trạng thái đã cập nhật
            }
        }

        // Phát sự kiện cho socket
        if (io) {
            io.emit('order_cancelled', { orderId, status: 'Khách hủy đơn' });
            io.emit('order_status', { order, status: 'Khách hủy đơn' });
            console.log(`Socket emitted for order ${orderId} with status 'Khách hủy đơn'`);
        } else {
            console.warn('Socket.io instance not found, cannot emit event');
        }

        return order; // Trả về đơn hàng đã cập nhật
    } catch (error) {
        console.error('Lỗi khi hủy đơn hàng:', error);
        throw new Error('Lỗi khi hủy đơn hàng');
    }
};

/**
 * Xóa đơn hàng theo orderId.
 * @param {String} orderId - ID của đơn hàng.
 * @returns {Object} - Thông báo xóa đơn hàng thành công.
 */
const deleteOrder = async (orderId) => {
    try {
        const result = await ModelOrder.deleteOne({ _id: orderId });
        if (result.deletedCount === 0) {
            throw new Error('Order not found');
        }
        return { message: 'Order deleted successfully' };
    } catch (error) {
        console.error('Error deleting order:', error);
        throw new Error('Error deleting order');
    }
};

// Chưa biết dùng cho cái gì 
const updateOrderStatus = async (orderId, status) => {
    try {
        const order = await ModelOrder.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!order) {
            throw new Error('Order not found');
        }

        let message = '';
        if (status === 'Đơn hàng đã được giao hoàn tất') {
            message = 'Đơn Hàng Của Bạn Đã được Giao Thành Công!';
        }

        if (message) {
            const notification = new Notification({
                message,
                recipient: order.customer,
            });
            await notification.save();
        }

        // Phát sự kiện cập nhật trạng thái qua socket.io
        req.io.emit('orderStatusUpdated', { orderId, status });
        req.io.emit('orderStatus', { orderId, status });

        return order;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw new Error('Error updating order status');
    }
};

// Người Dùng Bấm 
const updateOrderStatusAfterPayment = async (orderId, paymentMethod) => {
    console.log('Order with ID:', orderId); // Log kiểm tra orderId

    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật trạng thái của đơn hàng thành "Người dùng đã hủy đơn"
        order.paymentMethod = paymentMethod;
        order.status = 'Đang xử lý';
        order.updatedAt = Date.now();
        await order.save();

        // Tìm User có chứa đơn hàng này trong orders và cập nhật trạng thái
        const user = await ModelUser.findOne({ 'orders._id': orderId });
        if (user) {
            const orderItem = user.orders.id(orderId);
            if (orderItem) {
                orderItem.status = 'Đang xử lý'; // Cập nhật trạng thái trong orders
                await user.save(); // Lưu lại user với trạng thái đã cập nhật
            }
        }

        return order;
    } catch (error) {
        console.error('Lỗi khi hủy đơn hàng:', error);
        throw new Error('Lỗi khi hủy đơn hàng');
    }
};

// Cập nhật sản phẩm thành xóa mềm và chuyển trạng thái thành 'Đơn hàng tạm xóa'
const removeSoftDeleted = async (id) => {
    try {
        const orderInDB = await ModelOrder.findById(id);
        if (!orderInDB) {
            throw new Error('Order not found');
        }

        // Danh sách trạng thái cho phép xóa mềm
        const allowedStatuses = [
            'Giao hàng thành công',
            'Nhà hàng đã hủy đơn',
            'Shipper đã hủy đơn',
            'Người dùng đã hủy đơn'
        ];

        // Kiểm tra trạng thái hiện tại
        if (!allowedStatuses.includes(orderInDB.status)) {
            throw new Error('Đơn hàng đang trong quá trình xử lý, không thể xóa mềm.');
        }

        // Lưu trạng thái hiện tại trước khi xóa mềm
        const result = await ModelOrder.findByIdAndUpdate(
            id,
            {
                isDeleted: true,
                status: 'Đơn hàng tạm xóa',
                previousStatus: orderInDB.status // Lưu trạng thái trước khi xóa
            },
            { new: true } // Trả về document đã cập nhật
        );

        return result;
    } catch (error) {
        console.log('Remove Order error:', error.message);
        throw new Error(error.message);
    }
};

// Khôi phục trạng thái cho đơn hàng
const restoreAndSetAvailable = async (id) => {
    try {
        const orderInDB = await ModelOrder.findById(id);
        if (!orderInDB) {
            throw new Error('Order not found');
        }

        // Kiểm tra trạng thái trước đó đã được lưu
        if (!orderInDB.previousStatus) {
            throw new Error('Không thể khôi phục do thiếu trạng thái trước khi xóa.');
        }

        // Cập nhật trạng thái về trước khi xóa
        const result = await ModelOrder.findByIdAndUpdate(
            id,
            {
                isDeleted: false,
                status: orderInDB.previousStatus, // Trả về trạng thái trước khi xóa
                $unset: { previousStatus: '' } // Xóa trường previousStatus sau khi khôi phục
            },
            { new: true } // Trả về document đã cập nhật
        );

        return result;
    } catch (error) {
        console.log('Restore Order error:', error.message);
        throw new Error(error.message);
    }
};

// lấy order user theo 1 khoảng thời gian nhất định 
const getOrdersByUserCustomRange = async (userId, startDateInput, endDateInput) => {
    try {
        // Chuyển userId thành ObjectId nếu cần
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Kiểm tra và chuyển đổi ngày nhập vào thành đối tượng Date
        const startDate = new Date(startDateInput);
        const endDate = new Date(endDateInput);

        // Kiểm tra tính hợp lệ của khoảng thời gian
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error("Ngày không hợp lệ. Vui lòng nhập ngày theo định dạng hợp lệ (yyyy-mm-dd).");
        }

        // Đảm bảo `endDate` luôn là cuối ngày
        endDate.setUTCHours(23, 59, 59, 999);

        // Tìm các đơn hàng của user trong khoảng thời gian xác định
        const orders = await ModelOrder.find({
            'user._id': userObjectId, // Lọc theo userId
            orderDate: { $gte: startDate, $lte: endDate }, // Lọc theo ngày đặt hàng
            isDeleted: false // Chỉ lấy các đơn hàng chưa bị xóa
        }).sort({ updatedAt: -1 }); // Sắp xếp theo ngày cập nhật mới nhất

        // Tổng số đơn hàng
        const totalOrders = orders.length;

        // Trả về kết quả
        return {
            startDate, // Ngày bắt đầu
            endDate, // Ngày kết thúc
            totalOrders, // Tổng số đơn hàng
            orders // Danh sách đơn hàng
        };
    } catch (error) {
        // Ghi log lỗi nếu có
        console.error("Lỗi khi lấy danh sách đơn hàng của user:", error);
        // Ném ra lỗi cho hàm gọi
        throw new Error("Lỗi khi lấy danh sách đơn hàng của user.");
    }
};


module.exports = {
    addOrder, getOrderDetail, getOrdersByShop,
    confirmOrder, shopOwnerCancelOrder, deleteOrder,
    updateOrderStatus, CustomerCancelOrder,
    updateOrderStatusAfterPayment,
    getOrdersByUser, getOrdersByShipper,
    removeSoftDeleted, restoreAndSetAvailable,
    getOrdersByUserCustomRange
};
