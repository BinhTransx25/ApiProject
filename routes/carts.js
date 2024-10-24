const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart/CartController');

/**
 * @swagger
 * /carts/add:
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
 *               products:
 *                 type: string
 *                 description: ID của sản phẩm cần thêm vào giỏ hàng
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
 * /carts/update:
 *   put:
 *     summary: Cập nhật số lượng sản phẩm trong giỏ hàng
 *     description: Cập nhật số lượng sản phẩm đã có trong giỏ hàng của người dùng.
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
 *               productId:
 *                 type: string
 *                 description: ID của sản phẩm
 *               quantity:
 *                 type: integer
 *                 description: Số lượng sản phẩm cần cập nhật
 *     responses:
 *       200:
 *         description: Đã cập nhật số lượng sản phẩm thành công
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
 *         description: Lỗi khi cập nhật sản phẩm trong giỏ hàng
 */
router.put('/update', async (req, res) => {
    try {
        const { user, shopOwner, product, quantity } = req.body;
        const result = await cartController.updateQuantityProduct(user, shopOwner, product, quantity);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

/**
 * @swagger
 * /carts/delete:
 *   delete:
 *     summary: Xóa sản phẩm khỏi giỏ hàng
 *     description: Xóa một sản phẩm khỏi giỏ hàng của người dùng.
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
 *               productId:
 *                 type: string
 *                 description: ID của sản phẩm cần xóa khỏi giỏ hàng
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
router.put('/delete', async (req, res) => {
    try {
        const { user, shopOwner, product } = req.body;
        const result = await cartController.deleteFromCart(user, shopOwner, product);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

/**
 * @swagger
 * /carts/{user_id}:
 *   get:
 *     summary: Lấy danh sách giỏ hàng (đơn nháp) của người dùng
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: ID của người dùng
 *         schema:
 *           type: string
 *           example: "64a8d1b5f9babc234567890"
 *     responses:
 *       200:
 *         description: Danh sách giỏ hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   shopName:
 *                     type: string
 *                     example: "Nhà Hàng 123"
 *                   shopImage:
 *                     type: string
 *                     example: "https://example.com/images/shop123.png"
 *                   shopAddress:
 *                     type: string
 *                     example: "123 Đường ABC, Quận 1, TP.HCM"
 *                   totalItem:
 *                     type: integer
 *                     example: 3
 *                   totalPrice:
 *                     type: number
 *                     format: float
 *                     example: 250000.0
 *       400:
 *         description: Lỗi khi không tìm thấy người dùng hoặc không có giỏ hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.get('/:user', async (req, res) => {
    const { user } = req.params;
    try {
        const carts = await cartController.getCarts(user);
        return res.status(200).json({ status: true, data: carts });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message });
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

router.delete('/:user/', async (req, res) => {
    try {
        const { user } = req.params;
        const result = await cartController.deleteCartUser(user);
        return res.status(200).json({ status: true, message: result.message });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;
