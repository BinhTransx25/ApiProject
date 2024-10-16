const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart/CartController');

/**
 * @swagger
 * /carts/:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hàng
 *     description: Thêm sản phẩm cho người dùng vào giỏ hàng.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: ID của người dùng
 *               product:
 *                 type: object
 *                 description: Thông tin sản phẩm cần thêm vào giỏ hàng
 *                 properties:
 *                   productId:
 *                     type: string
 *                     description: ID của sản phẩm
 *                   quantity:
 *                     type: integer
 *                     description: Số lượng sản phẩm
 *     responses:
 *       200:
 *         description: Sản phẩm đã được thêm vào giỏ hàng thành công
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
 *         description: Lỗi khi thêm sản phẩm vào giỏ hàng
 */
router.post('/', async (req, res) => {
    try {
        const { user, product } = req.body;
        const result = await cartController.addToCart(user, product);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

/**
 * @swagger
 * /carts/{user}:
 *   get:
 *     summary: Lấy giỏ hàng của người dùng
 *     description: Lấy danh sách sản phẩm trong giỏ hàng của người dùng.
 *     parameters:
 *       - name: user
 *         in: path
 *         required: true
 *         description: ID của người dùng cần lấy giỏ hàng
 *         type: string
 *     responses:
 *       200:
 *         description: Giỏ hàng đã được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Lỗi khi lấy giỏ hàng
 */
router.get('/:user', async (req, res) => {
    try {
        const { user } = req.params;
        const result = await cartController.getCartsByUser(user);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;
