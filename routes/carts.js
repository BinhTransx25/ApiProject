const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart/CartController');

router.post('/', async (req, res) => {
    try {
        const { user, product } = req.body;
        const result = await cartController.addToCart(user, product);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

router.get('/:user', async (req, res) => {
    try {
        const { user } = req.params;
        const result = await cartController.getCartsByUser(user);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
})

module.exports = router;