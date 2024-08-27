const express = require('express');
const router = express.Router();
const ControllerShopAddress = require('../controllers/address/ShopOwner/ControllerAddressShopOwner');

router.post('/add', async (req, res) => {
    const { shopOwnerId, address, latitude, longitude } = req.body;
    try {
        let result = await ControllerShopAddress.addShopAddress(shopOwnerId, address, latitude, longitude);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.get('/:shopOwnerId', async (req, res) => {
    const { shopOwnerId } = req.params;
    try {
        let result = await ControllerShopAddress.getShopAddresses(shopOwnerId);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.get('/detail/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ControllerShopAddress.getShopAddressById(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { address, latitude, longitude } = req.body;
    try {
        let result = await ControllerShopAddress.updateShopAddress(id, address, latitude, longitude);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ControllerShopAddress.deleteShopAddress(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

module.exports = router;
