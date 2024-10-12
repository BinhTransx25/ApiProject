const express = require('express');
const router = express.Router();
const Notification = require('../controllers/notification/ControllerNotification');

/**
 * @swagger
 * /notifications/{userId}:
 *   get:
 *     summary: Lấy tất cả thông báo của người dùng
 *     description: Yêu cầu userId trong URL parameters để lấy thông báo cho người dùng đó.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID của người dùng cần lấy thông báo
 *         type: string
 *     responses:
 *       200:
 *         description: Thông báo đã được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Lỗi khi lấy thông báo
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
