const express = require('express');
const router = express.Router();
const ShipperController = require('../controllers/shipper/ControllerShipper');

/**
 * @swagger
 * /shippers/add:
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
    const { name, phone, email, address, role, rating, image, password } = req.body;
    try {
        let result = await ShipperController.addShipper(name, phone, email, address, role, rating, image, password);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shippers:
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
 * /shippers/{id}:
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
 * /shippers/update/{id}:
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
    const { id } = req.params;
    const updateData = req.body;
    try {
        let result = await ShipperController.updateShipper(id, updateData);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shippers/delete/{id}:
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
 * /shippers/update-location/{id}:
 *   put:
 *     summary: Cập nhật vị trí hiện tại của shipper
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
 *             properties:
 *               coordinates:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Vị trí của shipper đã được cập nhật
 */
router.put('/update-location/:id', async (req, res) => {
    const { id } = req.params;
    const { coordinates } = req.body;
    try {
        let result = await ShipperController.updateShipperLocation(id, coordinates);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shippers/confirm/{id}:
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
router.put('/confirm/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShipperController.confirmShipper(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shippers/cancel/{id}:
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
router.put('/cancel/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShipperController.cancelShipper(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shippers/confirm-order-shipper/{orderId}:
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
 */
router.patch('/confirm-order-shipper/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { shipperId } = req.body;
    try {
        const updatedOrder = await ControllerOrder.confirmOrderByShipper(orderId, shipperId);
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
