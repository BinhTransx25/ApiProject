const express = require('express');
const router = express.Router();
const ControllerUserAddress = require('../controllers/address/User/ControllerAddressUser');

router.post('/add', async (req, res) => {
    const { userId, recipientName, address, latitude, longitude, email, phone } = req.body;
    try {
        let result = await ControllerUserAddress.addUserAddress(userId, recipientName, address, latitude, longitude, email, phone);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        let result = await ControllerUserAddress.getUserAddresses(userId);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.get('/detail/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ControllerUserAddress.getUserAddressById(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { recipientName, address, latitude, longitude, email, phone } = req.body;
    try {
        let result = await ControllerUserAddress.updateUserAddress(id, recipientName, address, latitude, longitude, email, phone);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ControllerUserAddress.deleteUserAddress(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

module.exports = router;
