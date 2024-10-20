const express = require('express');
const router = express.Router();
const ControllerUserAddress = require('../controllers/address/User/ControllerAddressUser');

/**
 * @swagger
 * /userAddresses/add:
 *   post:
 *     summary: Thêm địa chỉ mới cho người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               recipientName:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/add', async (req, res) => {
    const { userId, recipientName, address, latitude, longitude, phone, label } = req.body;
    try {
        let result = await ControllerUserAddress.addUserAddress(userId, recipientName, address, latitude, longitude, phone, label);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /userAddresses/{userId}:
 *   get:
 *     summary: Lấy danh sách địa chỉ của người dùng
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        let result = await ControllerUserAddress.getUserAddresses(userId);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /userAddresses/detail/{id}:
 *   get:
 *     summary: Lấy chi tiết địa chỉ
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/detail/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ControllerUserAddress.getUserAddressById(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /userAddresses/update/{id}:
 *   put:
 *     summary: Cập nhật địa chỉ
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
 *               recipientName:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { recipientName, address, latitude, longitude, phone, label } = req.body;
    try {
        let result = await ControllerUserAddress.updateUserAddress(id, recipientName, address, latitude, longitude, phone, label);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /userAddresses/delete/{id}:
 *   delete:
 *     summary: Xóa địa chỉ
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ControllerUserAddress.deleteUserAddress(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

module.exports = router;
