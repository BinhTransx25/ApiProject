const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favorites/FavoriteController');


/**
 * @swagger
 * /favorites/add:
 *   post:
 *     summary: Thêm cửa hàng vào danh sách yêu thích của user
 *     tags: [Favorite]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID của user
 *               shopId:
 *                 type: string
 *                 description: ID của cửa hàng
 *     responses:
 *       200:
 *         description: Cửa hàng đã được thêm vào danh sách yêu thích thành công
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
 *         description: Lỗi khi thêm vào danh sách yêu thích
 */
// Thêm cửa hàng vào danh sách yêu thích
router.post('/add', async (req, res) => {
    const { userId, shopId } = req.body;
    try {
        const result = await FavoriteController.addFavorite(userId, shopId);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});


/**
 * @swagger
 * /favorites/{userId}:
 *   get:
 *     summary: Lấy danh sách yêu thích của user
 *     tags: [Favorite]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Danh sách các cửa hàng yêu thích của user
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
 *         description: Lỗi khi lấy danh sách yêu thích
 */
// Lấy danh sách yêu thích của user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const favorites = await FavoriteController.getFavoritesByUser(userId);
        return res.status(200).json({ status: true, data: favorites });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});
/**
 * @swagger
 * /favorites:
 *   delete:
 *     summary: Xóa cửa hàng khỏi danh sách yêu thích của user
 *     tags: [Favorite]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID của user
 *               shopId:
 *                 type: string
 *                 description: ID của cửa hàng
 *     responses:
 *       200:
 *         description: Đã xóa khỏi danh sách yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       500:
 *         description: Lỗi khi xóa khỏi danh sách yêu thích
 */
// Xóa cửa hàng khỏi danh sách yêu thích của user
router.delete('/delete', async (req, res) => {
    const { userId, shopId } = req.body;
    try {
        const result = await FavoriteController.removeFavorite(userId, shopId);
        return res.status(200).json({ status: true, message: 'Đã xóa khỏi danh sách yêu thích', data: result });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;
