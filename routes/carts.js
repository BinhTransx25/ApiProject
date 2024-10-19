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
 *               shopOwner:
 *                 type: string
 *                 description: ID của shop
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
router.post('/add', async (req, res) => {
    try {
        const { user, shopOwner, products } = req.body;
        const result = await cartController.addToCart(user, shopOwner, products);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

/**
 * @swagger
 * /carts/{user}:
 *   get:
 *     summary: Lấy tất cả giỏ hàng của người dùng
 *     description: Lấy danh sách giỏ hàng của người dùng.
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

/**
 * @swagger
 * /carts/{user}/{shopOwner}:
 *   get:
 *     summary: Lấy giỏ hàng của người dùng và shop
 *     description: Lấy chi tiết giỏ hàng của người dùng theo shop.
 *     parameters:
 *       - name: user
 *         in: path
 *         required: true
 *         description: ID của người dùng
 *         type: string
 *       - name: shopOwner
 *         in: path
 *         required: true
 *         description: ID của shop
 *         type: string
 *     responses:
 *       200:
 *         description: Chi tiết giỏ hàng đã được lấy thành công
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
 *         description: Lỗi khi lấy giỏ hàng
 */
router.get('/:user/:shopOwner', async (req, res) => {
    try {
        const { user, shopOwner } = req.params;
        const result = await cartController.getCartByUserAndShop(user, shopOwner);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

/**
 * @swagger
 * /carts/{user}/{shopOwner}/{productId}:
 *   delete:
 *     summary: Xóa sản phẩm khỏi giỏ hàng
 *     description: Xóa một sản phẩm ra khỏi giỏ hàng của người dùng.
 *     parameters:
 *       - name: user
 *         in: path
 *         required: true
 *         description: ID của người dùng
 *         type: string
 *       - name: shopOwner
 *         in: path
 *         required: true
 *         description: ID của shop
 *         type: string
 *       - name: productId
 *         in: path
 *         required: true
 *         description: ID của sản phẩm
 *         type: string
 *     responses:
 *       200:
 *         description: Sản phẩm đã được xóa khỏi giỏ hàng thành công
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
 *         description: Lỗi khi xóa sản phẩm khỏi giỏ hàng
 */
router.delete('/:user/:shopOwner/:productId', async (req, res) => {
    try {
        const { user, shopOwner, productId } = req.params;
        const result = await cartController.removeProductFromCart(user, shopOwner, productId);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

/**
 * @swagger
 * /carts/{user}/{shopOwner}:
 *   delete:
 *     summary: Xóa giỏ hàng
 *     description: Xóa toàn bộ giỏ hàng của người dùng và shop.
 *     parameters:
 *       - name: user
 *         in: path
 *         required: true
 *         description: ID của người dùng
 *         type: string
 *       - name: shopOwner
 *         in: path
 *         required: true
 *         description: ID của shop
 *         type: string
 *     responses:
 *       200:
 *         description: Giỏ hàng đã được xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Lỗi khi xóa giỏ hàng
 */
router.delete('/:user/:shopOwner', async (req, res) => {
    try {
        const { user, shopOwner } = req.params;
        const result = await cartController.deleteCart(user, shopOwner);
        return res.status(200).json({ status: true, message: result.message });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;
