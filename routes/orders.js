const express = require('express');
const router = express.Router();
const ControllerOrder = require('../controllers/order/ControllerOrder');

/**
 * @swagger
 * /orders/add-order:
 *   post:
 *     summary: Thêm đơn hàng mới
 *     description: Yêu cầu userId, order, shippingAddressId, paymentMethod, shopOwner và shipper trong request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               order:
 *                 type: object
 *               shippingAddressId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               shopOwner:
 *                 type: string
 *               shipper:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đơn hàng đã được thêm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Lỗi khi thêm đơn hàng
 */
router.post('/add-order', async (req, res) => {
    const { userId, order, shippingAddressId, paymentMethod, shopOwner, totalPrice, shipper } = req.body;
    const io = req.app.get('io');
    try {
        const addOrder = await ControllerOrder.addOrder(userId, order, shippingAddressId, paymentMethod, shopOwner, totalPrice, shipper, io);
        res.status(200).json({ status: true, data: addOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /orders/orders-by-shop:
 *   get:
 *     summary: Lấy danh sách đơn hàng theo shopId
 *     description: Yêu cầu shopId trong query parameters.
 *     parameters:
 *       - name: shopId
 *         in: query
 *         required: true
 *         description: ID của shop cần lấy danh sách đơn hàng
 *         type: string
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng đã được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Shop ID là bắt buộc
 *       500:
 *         description: Lỗi khi lấy danh sách đơn hàng
 */
router.get('/orders-by-shop', async function (req, res, next) {
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

router.get('/orders-by-user/:userId', async function (req, res, next) {
    try {
        const { userId } = req.params; // Lấy shopId từ query parameters
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Shop ID is required' });
        }
        const orders = await ControllerOrder.getOrdersByUser(userId); // Sử dụng hàm mới
        return res.status(200).json({ status: true, data: orders }); // cái chỗ này quan trọng nha, nhớ là để đặt tên khi trả về response
    } catch (error) {
        console.error('Get orders error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng
 *     description: Yêu cầu orderId trong URL parameters.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của đơn hàng cần lấy chi tiết
 *         type: string
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng đã được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Lỗi khi lấy chi tiết đơn hàng
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const order = await ControllerOrder.getOrderDetail(id);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /orders/confirm-order/{orderId}:
 *   patch:
 *     summary: Xác nhận đơn hàng
 *     description: Yêu cầu orderId trong request parameters.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: ID của đơn hàng cần xác nhận
 *         type: string
 *     responses:
 *       200:
 *         description: Đơn hàng đã được xác nhận
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Lỗi khi xác nhận đơn hàng
 */
router.patch('/confirm-order/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const io = req.app.get('io');  // Lấy io từ app (hoặc nơi bạn lưu trữ socket.io)

    try {
        const updatedOrder = await ControllerOrder.confirmOrder(orderId, io);
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /orders/cancel/{orderId}:
 *   patch:
 *     summary: Hủy đơn hàng
 *     description: Yêu cầu orderId trong request parameters.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: ID của đơn hàng cần hủy
 *         type: string
 *     responses:
 *       200:
 *         description: Đơn hàng đã bị hủy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Lỗi khi hủy đơn hàng
 */
router.patch('/shopOwnerCancel/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const io = req.app.get('io');  // Lấy io từ app (hoặc nơi bạn lưu trữ socket.io)

    try {
        const cancelledOrder = await ControllerOrder.shopOwnerCancelOrder(orderId, io);
        res.status(200).json(cancelledOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /orders/cancel/{orderId}:
 *   patch:
 *     summary: Hủy đơn hàng
 *     description: Yêu cầu orderId trong request parameters.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: ID của đơn hàng cần hủy
 *         type: string
 *     responses:
 *       200:
 *         description: Đơn hàng đã bị hủy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Lỗi khi hủy đơn hàng
 */
router.patch('/customerCancel/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const io = req.app.get('io');  // Lấy io từ app (hoặc nơi bạn lưu trữ socket.io)

    try {
        const cancelledOrder = await ControllerOrder.CustomerCancelOrder(orderId, io);
        res.status(200).json(cancelledOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * @swagger
 * /orders/{orderId}:
 *   delete:
 *     summary: Xóa đơn hàng
 *     description: Yêu cầu orderId trong URL parameters.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: ID của đơn hàng cần xóa
 *         type: string
 *     responses:
 *       200:
 *         description: Đơn hàng đã được xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Lỗi khi xóa đơn hàng
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

/**
 * @swagger
 * /orders/update-status/{orderId}:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng sau khi thanh toán
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: ID của đơn hàng
 *         schema:
 *           type: string
 *       - in: body
 *         name: paymentSuccess
 *         required: true
 *         description: Trạng thái thanh toán (true nếu thành công, false nếu thất bại)
 *         schema:
 *           type: object
 *           properties:
 *             paymentSuccess:
 *               type: boolean
 *               example: true
 *     responses:
 *       200:
 *         description: Trạng thái đơn hàng được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order {orderId} status updated successfully.
 *       400:
 *         description: Đầu vào không hợp lệ (paymentSuccess phải là boolean)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid input, paymentSuccess must be boolean
 *       500:
 *         description: Lỗi server khi cập nhật đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error updating order status
 */

// Thanh toán chuyển khoản thành công sẽ nhả về 1 response
// Lấy Status của response đó
// Thành công thì gọi hàm này để sửa trạng thái 
router.put('/Success-Payment/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await ControllerOrder.updateOrderStatusAfterPayment(orderId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ error: 'Error updating order status' });
    }
});


module.exports = router;
