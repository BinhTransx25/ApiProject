const express = require('express');
const router = express.Router();
const ShopOwnerController = require('../controllers/shopowner/ControllerShopOwner');

/**
 * @swagger
 * tags:
 *   name: ShopOwner
 *   description: Quản lý thông tin cửa hàng
 */

/**
 * @swagger
 * /shopOwner:
 *   get:
 *     summary: Lấy thông tin tất cả các cửa hàng
 *     tags: [ShopOwner]
 *     responses:
 *       200:
 *         description: Danh sách tất cả các cửa hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShopOwner'
 *       500:
 *         description: Lỗi khi lấy danh sách cửa hàng
 */
router.get('/', async (req, res) => {
    try {
        let result = await ShopOwnerController.getAllShopOwners();
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shopOwner/{id}:
 *   get:
 *     summary: Lấy thông tin cửa hàng theo ID
 *     tags: [ShopOwner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cửa hàng
 *     responses:
 *       200:
 *         description: Thông tin cửa hàng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShopOwner'
 *       404:
 *         description: Không tìm thấy cửa hàng
 *       500:
 *         description: Lỗi khi lấy thông tin cửa hàng
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShopOwnerController.getShopOwnerById(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shopOwner/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin cửa hàng
 *     tags: [ShopOwner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cửa hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên cửa hàng
 *               phone:
 *                 type: string
 *                 description: Số điện thoại
 *               email:
 *                 type: string
 *                 description: Email
 *               address:
 *                 type: string
 *                 description: Địa chỉ
 *               rating:
 *                 type: string
 *                 description: Đánh giá
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Ảnh cửa hàng
 *     responses:
 *       200:
 *         description: Cửa hàng đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShopOwner'
 *       404:
 *         description: Không tìm thấy cửa hàng
 *       500:
 *         description: Lỗi khi cập nhật thông tin cửa hàng
 */
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, address, rating, image } = req.body;
        const shopOwner = await ShopOwnerController.updateShopOwner(id, name, phone, email, address, rating, image);
        return res.status(200).json({ status: true, data: shopOwner });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shopOwner/delete/{id}:
 *   delete:
 *     summary: Xóa cửa hàng theo ID
 *     tags: [ShopOwner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cửa hàng
 *     responses:
 *       200:
 *         description: Cửa hàng đã bị xóa
 *       404:
 *         description: Không tìm thấy cửa hàng
 *       500:
 *         description: Lỗi khi xóa cửa hàng
 */
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShopOwnerController.deleteShopOwner(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.get('/timkiem', async (req, res) => {
    const { keyword } = req.query;
    try {
        let result = await ShopOwnerController.searchShopOwner(keyword);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

module.exports = router;

