const express = require('express');
const router = express.Router();
const ControllerAddress = require('../controllers/address/ControllerAddress');

/**
 * Add Address
 * method: POST
 * body: recipientName, address, email, phone
 * url: http://localhost:9999/addresses/add
 * response: new address
 */
router.post('/add', async (req, res) => {
    const { recipientName, address, email, phone } = req.body;
    try {
        let result = await ControllerAddress.addAddress(recipientName, address, email, phone);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * Get All Addresses
 * method: GET
 * url: http://localhost:9999/addresses
 * response: list of addresses
 */
router.get('/', async (req, res) => {
    try {
        let result = await ControllerAddress.getAllAddresses();
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * Get Address by ID
 * method: GET
 * params: id
 * url: http://localhost:9999/addresses/:id
 * response: address
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ControllerAddress.getAddressById(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * Update Address
 * method: PUT
 * body: recipientName, address, email, phone
 * url: http://localhost:9999/addresses/update/:id
 * response: updated address
 */
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { recipientName, address, email, phone } = req.body;
    try {
        let result = await ControllerAddress.updateAddress(id, recipientName, address, email, phone);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * Delete Address
 * method: DELETE
 * params: id
 * url: http://localhost:9999/addresses/delete/:id
 * response: deleted address
 */
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ControllerAddress.deleteAddress(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

module.exports = router;
