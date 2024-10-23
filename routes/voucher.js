const express = require('express');
const router = express.Router();
const VoucherController = require('../controllers/vouchers/ControllerVoucher');

/**
 * @swagger
 * /vouchers:
 *   post:
 *     summary: Tạo voucher mới
 *     description: Tạo một voucher mới với thông tin đã cho.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Mã voucher
 *               discountAmount:
 *                 type: number
 *                 description: Số tiền giảm giá
 *               minimumOrderAmount:
 *                 type: number
 *                 description: Tổng tiền đơn hàng tối thiểu để sử dụng voucher
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày hết hạn của voucher
 *               image:
 *                 type: string
 *                 description: Hình ảnh đại diện cho voucher
 *     responses:
 *       201:
 *         description: Voucher đã được tạo thành công
 *       400:
 *         description: Lỗi khi tạo voucher
 *       500:
 *         description: Lỗi server
 */
router.post('/add', async (req, res) => {
    const {code, discountAmount, minimumOrderAmount, expirationDate, image} = req.body;
    try {
        const newVoucher = await VoucherController.createVoucher(code, discountAmount, minimumOrderAmount, expirationDate, image);
        return res.status(201).json({ success: true, voucher: newVoucher });
    } catch (error) {
        console.error('Create voucher error:', error);
        return res.status(400).json({ success: false, error: 'Error creating voucher' });
    }
});

/**
 * @swagger
 * /vouchers:
 *   get:
 *     summary: Lấy tất cả các voucher
 *     description: Lấy danh sách tất cả các voucher trong hệ thống.
 *     responses:
 *       200:
 *         description: Danh sách các voucher
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 vouchers:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Lỗi khi lấy danh sách voucher
 */
router.get('/', async (req, res) => {
    try {
        const vouchers = await VoucherController.getAllVouchers();
        return res.status(200).json({ success: true, data:vouchers });
    } catch (error) {
        console.error('Fetch vouchers error:', error);
        return res.status(500).json({ success: false, error: 'Error fetching vouchers' });
    }
});

/**
 * @swagger
 * /vouchers/available/{orderTotal}:
 *   get:
 *     summary: Lấy danh sách voucher khả dụng
 *     description: Lấy các voucher khả dụng dựa trên tổng tiền đơn hàng.
 *     parameters:
 *       - name: orderTotal
 *         in: path
 *         required: true
 *         description: Tổng tiền đơn hàng để kiểm tra voucher khả dụng
 *         type: number
 *     responses:
 *       200:
 *         description: Danh sách voucher khả dụng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 availableVouchers:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Lỗi khi lấy danh sách voucher khả dụng
 */
router.get('/available/:orderTotal', async (req, res) => {
    try {
        const { orderTotal } = req.params;
        const availableVouchers = await VoucherController.getAvailableVouchers(orderTotal);
        return res.status(200).json({ success: true, data: availableVouchers });
    } catch (error) {
        console.error('Fetch available vouchers error:', error);
        return res.status(500).json({ success: false, error: 'Error fetching available vouchers' });
    }
});

/**
 * @swagger
 * /vouchers/{id}:
 *   get:
 *     summary: Lấy voucher theo ID
 *     description: Lấy thông tin voucher dựa trên ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của voucher cần lấy thông tin
 *         type: string
 *     responses:
 *       200:
 *         description: Thông tin voucher
 *       404:
 *         description: Không tìm thấy voucher
 *       500:
 *         description: Lỗi khi lấy thông tin voucher
 */
router.get('/detail/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const voucher = await VoucherController.getVoucherById(id);
        return res.status(200).json({ success: true, data: voucher });
    } catch (error) {
        console.error('Fetch voucher error:', error);
        return res.status(500).json({ success: false, error: 'Error fetching voucher' });
    }
});

/**
 * @swagger
 * /vouchers/{id}:
 *   delete:
 *     summary: Xóa voucher theo ID
 *     description: Xóa một voucher dựa trên ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của voucher cần xóa
 *         type: string
 *     responses:
 *       200:
 *         description: Voucher đã được xóa thành công
 *       404:
 *         description: Không tìm thấy voucher
 *       500:
 *         description: Lỗi khi xóa voucher
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await VoucherController.deleteVoucher(id);
        return res.status(200).json({ success: true, message: 'Voucher deleted successfully' });
    } catch (error) {
        console.error('Delete voucher error:', error);
        return res.status(500).json({ success: false, error: 'Error deleting voucher' });
    }
});

module.exports = router;
