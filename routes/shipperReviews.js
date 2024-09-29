const express = require('express');
const router = express.Router();
const ControllerShipperReview = require('../controllers/Review/ShipperReview/ControllerShipperReview');

// Route thêm đánh giá mới
router.post('/add', async (req, res) => {
// để theo đúng thứ tự với json thì mới gọi được nha ní 
const {order_id, shipper_id, user_id, rating, comment, image, } = req.body
    try {
        let result = await ControllerShipperReview.create(order_id, shipper_id, user_id, rating, comment, image,);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        console.log('Create ShipperReview error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

// Route lấy tất cả đánh giá
router.get('/', async (req, res) => {
    try {
        let result = await ControllerShipperReview.getAll();
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        console.log('Get all ShipperReviews error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

// Route lấy đánh giá theo ID
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

// Route xóa đánh giá
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

