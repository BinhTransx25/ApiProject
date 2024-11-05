const ModelOrder = require('./ModelOrder');
const ModelUser = require('../users/ModelUser');
const ModelAddress = require('../address/User/ModelAddressUser');
const ModelShopOwner = require('../shopowner/ModelShopOwner');
const ModelShipper = require('../shipper/ModelShipper');
const ModelVoucher = require('../vouchers/ModelVouher');
const ModelProduct = require('../products/ModelProduct')
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
const addOrder = async (userId, order, shippingAddressId, paymentMethod, shopOwnerId, totalPrice, shipperId, io, voucherId, shippingfee,distance) => {
    console.log("Adding order with data:", { userId, order, shippingAddressId, paymentMethod, shopOwnerId, shipperId });

    if (!userId || !order || !shippingAddressId || !paymentMethod || !shopOwnerId) {
        throw new Error('Missing required fields in request body');
    }

    try {
        // Tìm người dùng, địa chỉ, và shop owner
        const user = await ModelUser.findById(userId);
        if (!user) throw new Error('User not found');

        const address = await ModelAddress.findById(shippingAddressId);
        if (!address) throw new Error('Address not found');

        const shopOwner = await ModelShopOwner.findById(shopOwnerId);
        if (!shopOwner) throw new Error('Shop owner not found');

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
            shippingAddress: address,
            paymentMethod,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                image:user.image,
            },
            shopOwner: {
                _id: shopOwner._id,
                name: shopOwner.name,
                address: shopOwner.address,
                images: shopOwner.images,
                rating: shopOwner.rating,
            },
            totalPrice,
            shipper: shipper ? {
                _id: shipper._id,
                name: shipper.name,
                phone: shipper.phone,
                image: shipper.image,
            } : null,
            voucher: voucher ? {
                _id: voucher._id,
                code: voucher.code,
                discountAmount: voucher.discountAmount,
                minimumOrderAmount: voucher.minimumOrderAmount,
                expirationDate: voucher.expirationDate
            } : null,
            shippingfee,
            distance
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

        // Gửi thông báo đến cửa hàng liên quan
        io.to(String(shopOwner._id)).emit('new_order_created', { orderId: newOrder._id, order: newOrder });
        console.log(`New order created for shop owner ${shopOwner._id}: ${newOrder._id}`);

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

        // Cập nhật trạng thái của đơn hàng thành "Tìm người giao hàng"
        order.status = 'Tìm người giao hàng';
        await order.save();

        // Tìm User có chứa đơn hàng này trong orders và cập nhật trạng thái
        const user = await ModelUser.findOne({ 'orders._id': orderId });
        if (user) {
            const orderItem = user.orders.id(orderId); // Lấy đơn hàng trong orders có ID của order
            if (orderItem) {
                orderItem.status = 'Tìm người giao hàng'; // Cập nhật trạng thái trong orders
                await user.save(); // Lưu lại user với trạng thái đã cập nhật
            }
        }

        // Phát sự kiện tới tất cả các shipper nếu io tồn tại
        if (io) {
            io.emit('order_confirmed', { order, status: 'Tìm người giao hàng' });
            console.log(`Socket emitted for order ${orderId} with status 'Tìm người giao hàng'`);
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
const shopOwnerCancelOrder = async (orderId, io) => {
    console.log('Cancelling order with ID:', orderId); // Log kiểm tra orderId

    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật trạng thái của đơn hàng thành "Nhà hàng đã hủy đơn"
        order.status = 'Nhà hàng đã hủy đơn';
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

        // Phát sự kiện cho socket
        if (io) {
            io.emit('order_cancelled', { orderId, status: 'Nhà hàng đã hủy đơn' });
            console.log(`Socket emitted for order ${orderId} with status 'Nhà hàng đã hủy đơn'`);
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
            io.emit('order_cancelled', { orderId, status: 'Người dùng đã hủy đơn' });
            console.log(`Socket emitted for order ${orderId} with status 'Người dùng đã hủy đơn'`);
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

        return order;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw new Error('Error updating order status');
    }
};

// Người Dùng Bấm 
const updateOrderStatusAfterPayment = async (orderId) => {
    console.log('Order with ID:', orderId); // Log kiểm tra orderId

    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật trạng thái của đơn hàng thành "Người dùng đã hủy đơn"
        order.status = 'Chưa giải quyết';
        order.updatedAt = Date.now();
        await order.save();

        // Tìm User có chứa đơn hàng này trong orders và cập nhật trạng thái
        const user = await ModelUser.findOne({ 'orders._id': orderId });
        if (user) {
            const orderItem = user.orders.id(orderId);
            if (orderItem) {
                orderItem.status = 'Chưa giải quyết'; // Cập nhật trạng thái trong orders
                await user.save(); // Lưu lại user với trạng thái đã cập nhật
            }
        }

        return order;
    } catch (error) {
        console.error('Lỗi khi hủy đơn hàng:', error);
        throw new Error('Lỗi khi hủy đơn hàng');
    }
};

module.exports = {
    addOrder, getOrderDetail, getOrdersByShop,
    confirmOrder, shopOwnerCancelOrder, deleteOrder,
    updateOrderStatus, CustomerCancelOrder,
    updateOrderStatusAfterPayment,
    getOrdersByUser
};
