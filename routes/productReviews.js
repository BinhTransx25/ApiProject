const express = require('express');
const router = express.Router();
const ControllerProductReview = require('../controllers/Review/ProductReview/ControllerProductReview');

// Route xử lý tạo đánh giá mới
router.post('/add', async (req, res) => {
    // để theo đúng thứ tự với json thì mới gọi được nha ní 
    const {order_id, product_id, user_id, rating, comment, image, } = req.body
    try {
      
        let result = await ControllerProductReview.create(order_id, product_id, user_id, rating, comment, image,);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        console.log('Tạo đánh giá sản phẩm lỗi:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});


// Route xử lý xóa đánh giá theo id
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

// Route lấy tất cả đánh giá theo sản phẩm
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

// Route lấy tất cả đánh giá theo người dùng
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

module.exports = router;
