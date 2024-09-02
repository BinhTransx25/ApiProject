const express = require('express');
const router = express.Router();
const ShipperController = require('../controllers/shipper/ControllerShipper');

// Route thêm shipper mới
router.post('/add', async (req, res) => {
    const { name, phone, email, address } = req.body;
    try {
        let result = await ShipperController.addShipper(name, phone, email, address);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

// Route lấy tất cả các shipper
router.get('/', async (req, res) => {
    try {
        let result = await ShipperController.getAllShippers();
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

// Route lấy thông tin shipper theo ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShipperController.getShipperById(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

// Route cập nhật thông tin shipper
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        let result = await ShipperController.updateShipper(id, updateData);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

// Route xóa shipper
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShipperController.deleteShipper(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

// Route cập nhật vị trí hiện tại của shipper
router.put('/update-location/:id', async (req, res) => {
    const { id } = req.params;
    const { coordinates } = req.body;
    try {
        let result = await ShipperController.updateShipperLocation(id, coordinates);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

// Route xác nhận shipper
router.put('/confirm/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShipperController.confirmShipper(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

// Route hủy shipper
router.put('/cancel/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShipperController.cancelShipper(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * Route để shipper xác nhận đơn hàng.
 * Yêu cầu: orderId trong URL parameters, shipperId trong request body.
 */
router.patch('/confirm-order-shipper/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { shipperId } = req.body;
    try {
        const updatedOrder = await ControllerOrder.confirmOrderByShipper(orderId, shipperId);
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
