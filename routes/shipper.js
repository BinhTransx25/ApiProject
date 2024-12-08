const express = require('express');
const router = express.Router();
const ShipperController = require('../controllers/shipper/ControllerShipper');

/**
 * @swagger
 * /shipper/add:
 *   post:
 *     summary: Thêm shipper mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               role:
 *                 type: string
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shipper đã được thêm
 */
router.post('/add', async (req, res) => {
    const { name, phone, email, address, role, rating, image, password, gender, birthDate, vehicleBrand, vehiclePlate, verified, imageVerified } = req.body;
    try {
        let result = await ShipperController.addShipper(name, phone, email, address, role, rating, image, password, gender, birthDate, vehicleBrand, vehiclePlate, verified, imageVerified);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shipper:
 *   get:
 *     summary: Lấy tất cả shipper
 *     responses:
 *       200:
 *         description: Danh sách tất cả shipper
 */
router.get('/', async (req, res) => {
    try {
        let result = await ShipperController.getAllShippers();
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shipper/{id}:
 *   get:
 *     summary: Lấy thông tin shipper theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin shipper
 *       404:
 *         description: Shipper không tìm thấy
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShipperController.getShipperById(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shipper/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin shipper
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Shipper đã được cập nhật
 */
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, address, image, password, gender, birthDate, vehicleBrand, vehiclePlate, imageVerified } = req.body;
        const shipper = await ShipperController.updateShipper(id, name, phone, email, address, image, password, gender, birthDate, vehicleBrand, vehiclePlate, imageVerified);
        return res.status(200).json({ status: true, data: shipper });
    } catch (error) {
        console.log('Update shipper error:', error);
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shipper/delete/{id}:
 *   delete:
 *     summary: Xóa shipper theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shipper đã bị xóa
 */
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShipperController.deleteShipper(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});


/**
 * @swagger
 * /shipper/active/{id}:
 *   put:
 *     summary: Xác nhận shipper
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shipper đã được xác nhận
 */
router.put('/active/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShipperController.changeShipperStatusActive(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shipper/unActive/{id}:
 *   put:
 *     summary: Hủy shipper
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shipper đã bị hủy
 */
router.put('/unActive/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShipperController.changeShipperStatusUnActive(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shipper/confirm-order-shipper/{orderId}:
 *   patch:
 *     summary: Shipper xác nhận đơn hàng
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shipperId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đơn hàng đã được shipper xác nhận
 *       500:
 *         description: Lỗi xảy ra trong quá trình xác nhận
 */

/**
 * Xác nhận đơn hàng bởi shipper (kiểm tra có shipper hay không).
 */
router.patch('/confirm-order-shipper/:orderId', async (req, res) => {

    const { orderId } = req.params;
    const { shipperId } = req.body;
    const io = req.app.get('io');
    try {
        const result = await ShipperController.confirmOrderShipperExists(orderId, shipperId, io);
        if (result.message) {
            return res.status(400).json({ message: result.message });
        }
        res.status(200).json(result); // Trả về đơn hàng đã cập nhật
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/confirm-order-arrived-shopowner/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { shipperId } = req.body;
    const io = req.app.get('io');
    try {
        const updatedOrder = await ShipperController.confirmShipperArrivedShopOwner(orderId, shipperId, io);
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/confirm-order-on-delivery/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { shipperId } = req.body;
    const io = req.app.get('io');
    try {
        const updatedOrder = await ShipperController.confirmShipperOnDelivery(orderId, shipperId, io);
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/confirm-order-arrived-delivery-point/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { shipperId } = req.body;
    const io = req.app.get('io');
    try {
        const updatedOrder = await ShipperController.confirmShipperArrivedDeliveryPoint(orderId, shipperId, io);
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /shipper/confirm-order-finish/{orderId}:
 *   patch:
 *     summary: Xác nhận ID shipper cho đơn hàng
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           description: ID của đơn hàng cần xác nhận
 *       - in: body
 *         name: shipperId
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             shipperId:
 *               type: string
 *               description: ID của shipper xác nhận đơn hàng
 *     responses:
 *       200:
 *         description: Đơn hàng đã được cập nhật với shipper ID
 *       400:
 *         description: Thông báo lỗi nếu ID shipper không hợp lệ hoặc không có trong đơn hàng
 *       500:
 *         description: Lỗi server trong quá trình xác nhận đơn hàng
 */
router.patch('/confirm-order-finish/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { shipperId } = req.body;
    const io = req.app.get('io');
    try {
        const updatedOrder = await ShipperController.confirmOrderByShipperId(orderId, shipperId, io);
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /shipper/shipper-cancel-order/{orderId}:
 *   patch:
 *     summary: Xác nhận ID shipper cho đơn hàng
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           description: ID của đơn hàng cần xác nhận
 *       - in: body
 *         name: shipperId
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             shipperId:
 *               type: string
 *               description: ID của shipper xác nhận đơn hàng
 *     responses:
 *       200:
 *         description: Đơn hàng đã được cập nhật với shipper ID
 *       400:
 *         description: Thông báo lỗi nếu ID shipper không hợp lệ hoặc không có trong đơn hàng
 *       500:
 *         description: Lỗi server trong quá trình xác nhận đơn hàng
 */
router.patch('/shipper-cancel-order/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { shipperId, reason } = req.body;  // Lấy shipperId và reason từ body
    const io = req.app.get('io');

    try {
        if (!reason || reason.trim() === '') {
            return res.status(400).json({ error: 'Reason for cancellation is required' });  // Kiểm tra lý do hủy
        }

        const updatedOrder = await ShipperController.cancelOrderByShipperId(orderId, shipperId, reason.trim(), io);
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// hàm lấy doanh thu theo shipper_id và lọc theo ngày, tuần, tháng
// /shipper/{shipperId}/revenue?date={date}&filter={filter}

/**
 * @swagger
 * /shipper/{id}/revenue:
 *   get:
 *     summary: Lấy doanh thu của shipper theo ID và khoảng thời gian (ngày, tuần, tháng)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Lọc theo khoảng thời gian 'day', 'week', hoặc 'month'
 *     responses:
 *       200:
 *         description: Thông tin doanh thu của shipper
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                     totalOrders:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *                     cashTotal:
 *                       type: number
 *                     appTotal:
 *                       type: number
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Thiếu shipperId, ngày hoặc bộ lọc không hợp lệ
 *       500:
 *         description: Lỗi server
 */

router.get('/:shipperId/revenue', async (req, res) => {
    const { shipperId } = req.params;
    const { date, filter } = req.query;

    if (!date || !filter) {
        return res.status(400).json({ status: false, data: 'Ngày và bộ lọc là bắt buộc.' });
    }

    if (!['day', 'week', 'month'].includes(filter)) {
        return res.status(400).json({ status: false, data: "Filter không hợp lệ. Chỉ chấp nhận 'day', 'week', 'month'." });
    }

    try {
        const result = await ShipperController.getRevenueByShipper(shipperId, date, filter);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.get('/:shipperId/revenue/custom-range', async (req, res) => {
    const { shipperId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ status: false, data: 'startDate và endDate là bắt buộc.' });
    }

    try {
        const result = await ShipperController.getRevenueByShipperCustomRange(shipperId, startDate, endDate);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});


router.post('/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    try {
        const result = await ShipperController.changePassword(email, oldPassword, newPassword);
        return res.status(200).json({ status: true, message: result.message });
    } catch (error) {
        if (error.message === 'Error: Mật khẩu không đúng') {
            return res.status(401).json({ status: false, message: 'Mật khẩu cũ không chính xác' });
        }
        return res.status(500).json({ status: false, message: error.message });
    }
});

router.put('/verified/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShipperController.changeShipperVerified(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.delete('/softdelete/:id', async function (req, res, next) {
    try {
        const shipperId = req.params.id;
        const updatedShipper = await ShipperController.removeSoftDeleted(shipperId);

        if (updatedShipper) {
            return res.status(200).json({
                status: true,
                message: 'shipper successfully soft deleted',
                data: updatedShipper, // Trả về thông tin đã cập nhật
            });
        } else {
            return res.status(404).json({
                status: false,
                message: 'shipper not found',
            });
        }
    } catch (error) {
        console.log('Delete shipper error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

router.put('/restore/available/:id', async (req, res) => {
    try {
        const shipperId = req.params.id;
        const updatedShipper = await ShipperController.restoreAndSetAvailable(shipperId);

        return res.status(200).json({
            status: true,
            message: 'Shipper restored and set to available',
            data: updatedShipper,
        });
    } catch (error) {
        console.log('Restore shipper error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

module.exports = router;
