const express = require('express');
const router = express.Router();
const ControllerShipperReview = require('../controllers/Review/ShipperReview/ControllerShipperReview');

/**
 * @swagger
 * /shipperReviews/add:
 *   post:
 *     summary: Thêm đánh giá mới cho shipper
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *               shipper_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đánh giá shipper đã được thêm
 */
router.post('/add', async (req, res) => {
    const { order_id, shipper_id, user_id, rating, comment, image } = req.body;
    try {
        let result = await ControllerShipperReview.create(order_id, shipper_id, user_id, rating, comment, image);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        console.log('Create ShipperReview error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /shipperReviews:
 *   get:
 *     summary: Lấy tất cả các đánh giá shipper
 *     responses:
 *       200:
 *         description: Danh sách tất cả đánh giá
 */
router.get('/', async (req, res) => {
    try {
        let result = await ControllerShipperReview.getAll();
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        console.log('Get all ShipperReviews error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /shipperReviews/{id}:
 *   get:
 *     summary: Lấy đánh giá shipper theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin đánh giá
 *       404:
 *         description: Đánh giá không tìm thấy
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let result = await ControllerShipperReview.getById(id);
        if (!result) {
            return res.status(404).json({ status: false, error: 'ShipperReview not found' });
        }
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        console.log('Get ShipperReview by ID error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /shipperReviews/{id}:
 *   delete:
 *     summary: Xóa đánh giá shipper theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đánh giá đã được xóa
 *       404:
 *         description: Đánh giá không tìm thấy
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let result = await ControllerShipperReview.remove(id);
        if (!result) {
            return res.status(404).json({ status: false, error: 'ShipperReview not found' });
        }
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        console.log('Remove ShipperReview error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

module.exports = router;
