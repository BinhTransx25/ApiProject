const express = require('express');
const router = express.Router();
const ControllerProductReview = require('../controllers/Review/ProductReview/ControllerProductReview');

/**
 * @swagger
 * /productReviews/add:
 *   post:
 *     summary: Tạo đánh giá mới cho đơn hàng
 *     tags: [Product Reviews]
 *     description: Tạo một đánh giá mới cho đơn hàng, chứa tất cả sản phẩm của đơn hàng trong cột `product`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *                 description: ID của đơn hàng cần đánh giá
 *                 example: "612e4b8f8e3b9c001d6a4c5e"
 *               user_id:
 *                 type: string
 *                 description: ID của người dùng đánh giá
 *                 example: "612e4b8f8e3b9c001d6a4c5f"
 *               rating:
 *                 type: integer
 *                 description: Đánh giá theo thang điểm (1-5)
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 description: Bình luận của người dùng
 *                 example: "Sản phẩm tốt, giao hàng nhanh"
 *               image:
 *                 type: string
 *                 description: URL tới hình ảnh đánh giá nếu có
 *                 example: "https://example.com/review-image.jpg"
 *     responses:
 *       201:
 *         description: Đánh giá được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "612e4b8f8e3b9c001d6a4c5g"
 *                     rating:
 *                       type: integer
 *                       example: 4
 *                     comment:
 *                       type: string
 *                       example: "Sản phẩm tốt, giao hàng nhanh"
 *                     image:
 *                       type: string
 *                       example: "https://example.com/review-image.jpg"
 *                     order_id:
 *                       type: string
 *                       example: "612e4b8f8e3b9c001d6a4c5e"
 *                     product:
 *                       type: array
 *                       description: Mảng sản phẩm trong đơn hàng
 *                       items:
 *                         type: object
 *                         properties:
 *                           product_id:
 *                             type: string
 *                             example: "612e4b8f8e3b9c001d6a4c5h"
 *                           name:
 *                             type: string
 *                             example: "Tên sản phẩm"
 *                           quantity:
 *                             type: integer
 *                             example: 2
 *                           price:
 *                             type: number
 *                             format: float
 *                             example: 50.0
 *                     user:
 *                       type: object
 *                       description: Thông tin người dùng đánh giá
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "612e4b8f8e3b9c001d6a4c5f"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         phone:
 *                           type: string
 *                           example: "1234567890"
 *                         email:
 *                           type: string
 *                           example: "johndoe@example.com"
 *                         image:
 *                           type: string
 *                           example: "https://example.com/profile-image.jpg"
 *       500:
 *         description: Lỗi khi tạo đánh giá
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi tạo đánh giá sản phẩm"
 */

router.post('/add', async (req, res) => {
    const { order_id, user_id, rating, comment, image } = req.body;
    try {
        // Gọi hàm tạo đánh giá mới và xử lý dữ liệu
        const result = await ControllerProductReview.create(order_id, user_id, rating, comment, image);
        return res.status(201).json({ status: true, data: result });
    } catch (error) {
        console.log('Tạo đánh giá sản phẩm lỗi:', error);
        return res.status(500).json({ status: false, message: error.message });
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
 *         description: ID của sản phẩm cần lấy đánh giá
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
 *                     properties:
 *                       rating:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       image:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           email:
 *                             type: string
 *                           image:
 *                             type: string
 *       404:
 *         description: Không tìm thấy đánh giá cho sản phẩm này
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

        // Kiểm tra xem có đánh giá nào không
        if (reviews.length === 0) {
            return res.status(404).json({ status: false, message: "No reviews found for this product." });
        }

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
 *                     properties:
 *                       rating:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       image:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           email:
 *                             type: string
 *                           image:
 *                             type: string
 *                       product:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             price:
 *                               type: number
 *       404:
 *         description: Không tìm thấy đánh giá cho sản phẩm của chủ cửa hàng này
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

        // Kiểm tra xem có đánh giá nào không
        if (reviews.length === 0) {
            return res.status(404).json({ status: false, message: "No reviews found for products of this shop owner." });
        }

        return res.status(200).json({ status: true, data: reviews });
    } catch (error) {
        console.log('Get reviews by shop owner ID error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});


module.exports = router;
