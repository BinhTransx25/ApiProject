const express = require('express');
const router = express.Router();
const ControllerProductReview = require('../controllers/Review/ProductReview/ControllerProductReview');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Các route liên quan đến đánh giá sản phẩm
 */

/**
 * @swagger
 * /productReviews/add:
 *   post:
 *     summary: Tạo đánh giá mới cho sản phẩm
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đánh giá sản phẩm được tạo thành công
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
 *         description: Lỗi khi tạo đánh giá
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/add', async (req, res) => {
    const { order_id, product_id, user_id, rating, comment, image } = req.body;
    try {
        let result = await ControllerProductReview.create(order_id, product_id, user_id, rating, comment, image);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        console.log('Tạo đánh giá sản phẩm lỗi:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /productReviews/{id}:
 *   delete:
 *     summary: Xóa đánh giá theo ID
 *     tags: [Reviews]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID của đánh giá
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đánh giá đã được xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Không tìm thấy đánh giá
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Lỗi khi xóa đánh giá
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let result = await ControllerProductReview.remove(id);
        if (!result) {
            return res.status(404).json({ status: false, error: 'Review not found' });
        }
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        console.log('Remove product review error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /productReviews/product/{product_id}:
 *   get:
 *     summary: Lấy tất cả đánh giá của một sản phẩm
 *     tags: [Reviews]
 *     parameters:
 *       - name: product_id
 *         in: path
 *         description: ID của sản phẩm
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách đánh giá của sản phẩm
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
 *         description: Lỗi khi lấy đánh giá
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.get('/product/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;
        const reviews = await ControllerProductReview.getAllByProduct(product_id);
        return res.status(200).json({ status: true, data: reviews });
    } catch (error) {
        console.log('Get product reviews error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /productReviews/user/{user_id}:
 *   get:
 *     summary: Lấy tất cả đánh giá của một người dùng
 *     tags: [Reviews]
 *     parameters:
 *       - name: user_id
 *         in: path
 *         description: ID của người dùng
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách đánh giá của người dùng
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
 *         description: Lỗi khi lấy đánh giá
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.get('/user/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const reviews = await ControllerProductReview.getAllByUser(user_id);
        return res.status(200).json({ status: true, data: reviews });
    } catch (error) {
        console.log('Get user reviews error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});


/**
 * @swagger
 * /productReviews/shop/{shopOwnerId}:
 *   get:
 *     summary: Lấy tất cả đánh giá của sản phẩm theo shopOwnerId
 *     tags: [Reviews]
 *     parameters:
 *       - name: shopOwnerId
 *         in: path
 *         description: ID của chủ cửa hàng
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách đánh giá của sản phẩm theo shopOwnerId
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
 *         description: Lỗi khi lấy đánh giá
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

router.get('/shop/:shopOwnerId', async (req, res) => {
    try {
        const { shopOwnerId } = req.params;
        const reviews = await ControllerProductReview.getReviewProductByShopId(shopOwnerId);
        return res.status(200).json({ status: true, data: reviews });
    } catch (error) {
        console.log('Get reviews by shop owner ID error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

module.exports = router;
