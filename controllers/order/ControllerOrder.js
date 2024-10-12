const ModelOrder = require('./ModelOrder');
const ModelUser = require('../users/ModelUser');
const ModelAddress = require('../address/User/ModelAddressUser');
const ModelShopOwner = require('../shopowner/ModelShopOwner');
const ModelShipper = require('../shipper/ModelShipper');
const Notification = require('../notification/ModelNotification');
const mongoose = require('mongoose');

/**
 * Thêm đơn hàng mới.
 * @param {String} userId - ID của người dùng.
 * @param {Array} order - Danh sách sản phẩm trong đơn hàng.
 * @param {String} shippingAddressId - ID của địa chỉ giao hàng.
 * @param {String} paymentMethod - Phương thức thanh toán.
 * @param {String} shopOwnerId - ID của chủ cửa hàng.
 * @returns {Array} - Danh sách carts đã được cập nhật của người dùng.
 */
const addOrder = async (userId, order, shippingAddressId, paymentMethod, shopOwnerId, shipperId) => {
    console.log("Adding order with data:", { userId, order, shippingAddressId, paymentMethod, shopOwnerId, shipperId });

    if (!userId || !order || !shippingAddressId || !paymentMethod || !shopOwnerId) {
        const errorMessage = 'Missing required fields in request body';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    try {
        let user = await ModelUser.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        let address = await ModelAddress.findById(shippingAddressId);
        if (!address) {
            throw new Error('Address not found');
        }

        let shopOwner = await ModelShopOwner.findById(shopOwnerId);
        if (!shopOwner) {
            throw new Error('Shop owner not found');
        }

        let shipper = await ModelShipper.findById(shipperId);
        if (!shipper) {
            throw new Error('shipper not found');

        }
        const newOrder = new ModelOrder({
            items: order.map(item => ({
                name: item.name,
                description: item.description,
                price: item.price,
                quantity: item.quantity,
            })),
            shippingAddress: address,
            paymentMethod,
            shopOwner: {
                _id: shopOwner._id,
                name: shopOwner.name,
                phone: shopOwner.phone
            },
            shipper: {
                _id: shipper._id,
                name: shipper.name,
                phone: shipper.phone
            }
        });

        await newOrder.save();

        // Thêm đơn hàng mới vào danh sách carts của người dùng
        user.orders.push(newOrder);
        await user.save();

        return user.orders; // Trả về danh sách carts của người dùng
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
 * Xác nhận đơn hàng theo orderId.
 * @param {String} orderId - ID của đơn hàng.
 * @param {String} shipperId - ID của shipper.
 * @returns {Object} - Đơn hàng đã được xác nhận.
 */
// Hàm confirmOrder với socket.io
const confirmOrder = async (orderId, io) => {
    console.log('Confirming order with ID:', orderId); // Log kiểm tra orderId

    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật trạng thái của đơn hàng thành "find delivery person"
        order.status = 'find delivery person';
        await order.save();

        // Tìm User có chứa đơn hàng này trong orders và cập nhật trạng thái
        const user = await ModelUser.findOne({ 'orders._id': orderId });
        if (user) {
            const orderItem = user.orders.id(orderId); // Lấy đơn hàng trong orders có ID của order
            if (orderItem) {
                orderItem.status = 'find delivery person'; // Cập nhật trạng thái trong orders
                await user.save(); // Lưu lại user với trạng thái đã cập nhật
            }
        }

        // Phát sự kiện tới tất cả các shipper nếu io tồn tại
        if (io) {
            io.emit('order_confirmed', { orderId, status: 'find delivery person' });
            console.log(`Socket emitted for order ${orderId} with status 'find delivery person'`);
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
const cancelOrder = async (orderId, io) => {
    console.log('Cancelling order with ID:', orderId); // Log kiểm tra orderId

    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật trạng thái của đơn hàng thành "cancelled"
        order.status = 'cancelled';
        await order.save();

        // Tìm User có chứa đơn hàng này trong orders và cập nhật trạng thái
        const user = await ModelUser.findOne({ 'orders._id': orderId });
        if (user) {
            const orderItem = user.orders.id(orderId); // Lấy đơn hàng trong orders có ID của order
            if (orderItem) {
                orderItem.status = 'cancelled'; // Cập nhật trạng thái trong orders
                await user.save(); // Lưu lại user với trạng thái đã cập nhật
            }
        }

           // Phát sự kiện cho socket
           if (io) {
            io.emit('order_cancelled', { orderId, status: 'cancelled' });
            console.log(`Socket emitted for order ${orderId} with status 'cancelled'`);
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

const updateOrderStatus = async (orderId, status) => {
    try {
        const order = await ModelOrder.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!order) {
            throw new Error('Order not found');
        }

        let message = '';
        if (status === 'delivered') {
            message = 'Your order has been delivered successfully!';
        } else if (status === 'shipped') {
            message = 'Your order has been shipped!';
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

        return order;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw new Error('Error updating order status');
    }
};

module.exports = {
    addOrder, getOrderDetail, getOrdersByShop,
    confirmOrder, cancelOrder, deleteOrder, updateOrderStatus
};
