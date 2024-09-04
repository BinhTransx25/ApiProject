const express = require('express');
const router = express.Router();
const ControllerOrder = require('../controllers/order/ControllerOrder');

/**
 * Route để thêm đơn hàng mới.
 * Yêu cầu: userId, order, shippingAddressId, paymentMethod, shopOwnerId trong request body.
 */
router.post('/add-order', async (req, res) => {
    const { userId, order, shippingAddressId, paymentMethod, shopOwner, shipper } = req.body;
    try {
        const addOrder = await ControllerOrder.addOrder(userId, order, shippingAddressId, paymentMethod, shopOwner, shipper);
        res.status(200).json({ status: true, data: addOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Route để lấy danh sách đơn hàng theo shopId.
 * Yêu cầu: shopId trong query parameters.
 */
router.get('/orders-by-shop', async (req, res) => {
    try {
        const { shopId } = req.query; // Lấy shopId từ query parameters
        if (!shopId) {
            return res.status(400).json({ success: false, message: 'Shop ID is required' });
        }
        
        const orders = await ControllerOrder.getOrdersByShop(shopId); // Sử dụng hàm mới
        return res.status(200).json({ success: true, orders }); // cái chỗ này quan trọng nha, nhớ là để đặt tên khi trả về response
    } catch (error) {
        console.error('Get orders error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Route để lấy chi tiết đơn hàng theo orderId.
 * Yêu cầu: orderId trong URL parameters.
 */
router.get('/:id', async (req, res) => {
    const { id} = req.params;
    try {
        const order = await ControllerOrder.getOrderDetail(id);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * Route để xác nhận đơn hàng theo orderId.
 * Yêu cầu: orderId trong URL parameters.
 */
/**
 * Route để xác nhận đơn hàng.
 * Yêu cầu: orderId trong request parameters.
 */
router.patch('/confirm-order/:orderId', async (req, res) => {
    const { orderId } = req.params;
    try {
        const updatedOrder = await ControllerOrder.confirmOrder(orderId);
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * Route để hủy đơn hàng theo orderId.
 * Yêu cầu: orderId trong URL parameters.
 */
router.patch('/cancel/:orderId', async (req, res) => {
    const { orderId } = req.params;
    try {
        const cancelledOrder = await ControllerOrder.cancelOrder(orderId);
        res.status(200).json(cancelledOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Route để xóa đơn hàng theo orderId.
 * Yêu cầu: orderId trong URL parameters.
 */
router.delete('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await ControllerOrder.deleteOrder(orderId);
        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        console.error('Delete order error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
