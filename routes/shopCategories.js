const express = require('express');
const router = express.Router();
const ControllerShopCategory = require('../controllers/categories/ShopCategory/ControllerShopCategory');

/**
 * @swagger
 * /shopCategories:
 *   get:
 *     summary: Lấy danh sách tất cả danh mục
 *     responses:
 *       200:
 *         description: Danh sách tất cả các danh mục
 */
router.get('/', async (req, res, next) => {
    try {
        const categories = await ControllerShopCategory.getAllCategories();
        return res.status(200).json({ status: true, data: categories });
    } catch (error) {
        console.log('Get all categories error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /shopCategories/{id}:
 *   get:
 *     summary: Lấy thông tin danh mục theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin danh mục cụ thể
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const shopCategory = await ControllerShopCategory.getCategoryById(id);
        return res.status(200).json({ status: true, data: shopCategory });
    } catch (error) {
        console.log('Get category by id error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

/**
 * @swagger
 * /shopCategories:
 *   post:
 *     summary: Thêm danh mục mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Danh mục mới đã được thêm
 */
router.post('/', async (req, res, next) => {
    try {
        const { name, image } = req.body;
        const shopCategories = await ControllerShopCategory.insert(name, image);
        return res.status(200).json({ status: true, data: shopCategories });
    } catch (error) {
        console.log('Insert product error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

/**
 * @swagger
 * /shopCategories/{id}:
 *   put:
 *     summary: Cập nhật danh mục theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Danh mục đã được cập nhật
 */
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, image } = req.body;
        const shopCategories = await ControllerShopCategory.update(id, name, image);
        return res.status(200).json({ status: true, data: shopCategories });
    } catch (error) {
        console.log('Update product error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

/**
 * @swagger
 * /shopCategories/{id}:
 *   delete:
 *     summary: Xóa danh mục theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh mục đã được xóa
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let shopCategories = await ControllerShopCategory.remove(id);
        return res.status(200).json({ status: true, data: shopCategories });
    } catch (error) {
        console.log('Remove product error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

module.exports = router;