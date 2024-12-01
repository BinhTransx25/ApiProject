const express = require('express');
const router = express.Router();
const ShopOwnerController = require('../controllers/shopowner/ControllerShopOwner');

/**
 * @swagger
 * tags:
 *   name: ShopOwner
 *   description: Quản lý thông tin cửa hàng
 */

/**
 * @swagger
 * /shopOwner:
 *   get:
 *     summary: Lấy thông tin tất cả các cửa hàng
 *     tags: [ShopOwner]
 *     responses:
 *       200:
 *         description: Danh sách tất cả các cửa hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShopOwner'
 *       500:
 *         description: Lỗi khi lấy danh sách cửa hàng
 */
router.get('/', async (req, res) => {
    try {
        let result = await ShopOwnerController.getAllShopOwners();
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shopOwner/{id}:
 *   get:
 *     summary: Lấy thông tin cửa hàng theo ID
 *     tags: [ShopOwner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cửa hàng
 *     responses:
 *       200:
 *         description: Thông tin cửa hàng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShopOwner'
 *       404:
 *         description: Không tìm thấy cửa hàng
 *       500:
 *         description: Lỗi khi lấy thông tin cửa hàng
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShopOwnerController.getShopOwnerById(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shopOwner/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin cửa hàng
 *     tags: [ShopOwner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cửa hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên cửa hàng
 *               phone:
 *                 type: string
 *                 description: Số điện thoại
 *               email:
 *                 type: string
 *                 description: Email
 *               address:
 *                 type: string
 *                 description: Địa chỉ
 *               rating:
 *                 type: string
 *                 description: Đánh giá
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Ảnh cửa hàng
 *     responses:
 *       200:
 *         description: Cửa hàng đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShopOwner'
 *       404:
 *         description: Không tìm thấy cửa hàng
 *       500:
 *         description: Lỗi khi cập nhật thông tin cửa hàng
 */
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, address, rating, images, openingHours, closeHours} = req.body;
        const shopOwner = await ShopOwnerController.updateShopOwner(id, name, phone, email, address, rating, images, openingHours, closeHours);
        return res.status(200).json({ status: true, data: shopOwner });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shopOwner/delete/{id}:
 *   delete:
 *     summary: Xóa cửa hàng theo ID
 *     tags: [ShopOwner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cửa hàng
 *     responses:
 *       200:
 *         description: Cửa hàng đã bị xóa
 *       404:
 *         description: Không tìm thấy cửa hàng
 *       500:
 *         description: Lỗi khi xóa cửa hàng
 */
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShopOwnerController.deleteShopOwner(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shopOwner/search:
 *   post:
 *     summary: Tìm kiếm cửa hàng và danh mục theo từ khóa
 *     tags: [ShopOwner]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm cho tên cửa hàng hoặc danh mục
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm cho cửa hàng và danh mục
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                         example: "shop" # Hoặc "category"
 *       400:
 *         description: Thiếu từ khóa tìm kiếm
 *       500:
 *         description: Lỗi khi tìm kiếm cửa hàng hoặc danh mục
 */
router.post('/search', async (req, res) => {
    const { keyword } = req.query;
    try {
        let result = await ShopOwnerController.searchShopOwner(keyword);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shopOwner/favorite/{shopOwnerId}:
 *   put:
 *     summary: Thay đổi trạng thái yêu thích của cửa hàng
 *     tags: [ShopOwner]
 *     parameters:
 *       - in: path
 *         name: shopOwnerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cửa hàng
 *     responses:
 *       200:
 *         description: Thay đổi trạng thái yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 shop:
 *                   $ref: '#/components/schemas/ShopOwner'
 *       404:
 *         description: Không tìm thấy cửa hàng
 *       500:
 *         description: Lỗi khi thay đổi trạng thái yêu thích
 */
router.put('/favorite/:shopOwnerId', async (req, res) => {
    try {
        const { shopOwnerId } = req.params;
        const result = await ShopOwnerController.toggleFavorite(shopOwnerId);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

/**
 * @swagger
 * /shopOwner/favorites:
 *   get:
 *     summary: Lấy danh sách cửa hàng yêu thích
 *     tags: [ShopOwner]
 *     responses:
 *       200:
 *         description: Danh sách các cửa hàng yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShopOwner'
 *       500:
 *         description: Lỗi khi lấy danh sách cửa hàng yêu thích
 */
router.get('/favorites', async (req, res) => {
    try {
        const result = await ShopOwnerController.getFavoriteShops();
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});
/**
 * @swagger
 * /shopOwner/{shopId}/revenue:
 *   get:
 *     summary: Lấy doanh thu của shipper theo ID và khoảng thời gian (ngày, tuần, tháng)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Lọc theo khoảng thời gian 'day', 'week', hoặc 'month'
 *     responses:
 *       200:
 *         description: Thông tin doanh thu của shipper
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                     totalOrders:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *                     cashTotal:
 *                       type: number
 *                     appTotal:
 *                       type: number
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Thiếu shipperId, ngày hoặc bộ lọc không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get('/:shopId/revenue', async (req, res) => {
    const { shopId } = req.params;
    const { date, filter } = req.query;

    if (!date || !filter) {
        return res.status(400).json({ status: false, data: 'Ngày và bộ lọc là bắt buộc.' });
    }

    if (!['day', 'week', 'month'].includes(filter)) {
        return res.status(400).json({ status: false, data: "Filter không hợp lệ. Chỉ chấp nhận 'day', 'week', 'month'." });
    }

    try {
        const result = await ShopOwnerController.getRevenueByShopOwner(shopId, date, filter);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.post('/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    try {
        const result = await ShopOwnerController.changePassword(email, oldPassword, newPassword);
        return res.status(200).json({ status: true, message: result.message });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

// Cập nhật shopCategory
router.put("/shopCategory/:shopOwnerId", async (req, res) => {
    try {
        const { shopOwnerId } = req.params;
        const { shopCategory_ids } = req.body; // Danh sách shopCategory từ client

        // Gọi hàm controller để cập nhật
        const result = await ShopOwnerController.updateShopCategory(shopOwnerId, shopCategory_ids);

        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

router.put('/open/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShopOwnerController.changeShopOwnerStatusOpen(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.put('/closed/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShopOwnerController.changeShopOwnerStatusClosed(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.put('/unactive/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShopOwnerController.changeShopOwnerStatusUnactive(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
});

router.put('/verified/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await ShopOwnerController.changeShopOwnerVerified(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ status: false, data: error.message });
    }
}); 
module.exports = router;

