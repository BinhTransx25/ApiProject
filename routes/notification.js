const express = require('express');
const router = express.Router();
const Notification = require('../controllers/notification/ControllerNotification');

/**
 * Route để lấy tất cả thông báo của người dùng.
 * Yêu cầu: userId trong URL parameters.
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ recipient: userId });
        return res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return res.status(500).json({ success: false, error: 'Error fetching notifications' });
    }
});

module.exports = router;
