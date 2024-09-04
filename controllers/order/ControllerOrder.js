const ModelOrder = require('./ModelOrder');
const ModelUser = require('../users/ModelUser');
const ModelAddress = require('../address/User/ModelAddressUser');
const ModelShopOwner = require('../shopowner/ModelShopOwner');
const ModelShipper = require('../shipper/ModelShipper');

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

    if (!userId || !order || !shippingAddressId || !paymentMethod || !shopOwnerId ) {
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

        let shipper = shipperId ? await ModelShipper.findById(shipperId) : {};
        if(!shipper){
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
            shipper :{
                _id: shipper._id,
                name: shipper.name,
                phone: shipper.phone
            }
        });

        await newOrder.save();

        // Thêm đơn hàng mới vào danh sách carts của người dùng
        user.carts.push(newOrder);
        await user.save();

        return user.carts; // Trả về danh sách carts của người dùng
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
        const orders = await ModelOrder.find({ 'shopOwner._id': shopId });
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
const confirmOrder = async (orderId) => {
    console.log('Confirming order with ID:', orderId); // Thêm log kiểm tra orderId

    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật trạng thái của đơn hàng thành "processing"
        order.status = 'find delivery person';
        await order.save();

        // Tìm User có chứa đơn hàng này trong carts và cập nhật trạng thái
        const user = await ModelUser.findOne({ 'carts._id': orderId });
        if (user) {
            const cartItem = user.carts.id(orderId);  // Lấy item trong carts có ID của order
            console.log('itemmmmmmmmmm:', cartItem);
            if (cartItem) {
                cartItem.status = 'find delivery person'; // Cập nhật trạng thái trong carts
                await user.save(); // Lưu lại user với trạng thái đã cập nhật
            }
            
            
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
const cancelOrder = async (orderId) => {
    console.log('Cancelling order with ID:', orderId); // Thêm log kiểm tra orderId

    try {
        // Tìm đơn hàng theo ID
        const order = await ModelOrder.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật trạng thái của đơn hàng thành "processing"
        order.status = 'cancelled';
        await order.save();

        // Tìm User có chứa đơn hàng này trong carts và cập nhật trạng thái
        const user = await ModelUser.findOne({ 'carts._id': orderId });
        if (user) {
            const cartItem = user.carts.id(orderId);  // Lấy item trong carts có ID của order
            if (cartItem) {
                cartItem.status = 'cancelled'; // Cập nhật trạng thái trong carts
                await user.save(); // Lưu lại user với trạng thái đã cập nhật
            }
        }

        return order; // Trả về đơn hàng đã cập nhật
    } catch (error) {
        console.error('Error confirming order:', error);
        throw new Error('Error confirming order');
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


module.exports = { addOrder, getOrderDetail, getOrdersByShop, 
    confirmOrder, cancelOrder, deleteOrder };
