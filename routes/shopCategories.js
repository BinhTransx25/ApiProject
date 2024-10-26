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
 * /categories/{categoryId}/shops:
 *   get:
 *     summary: Get all shops by category
 *     tags: [Shop]
 *     description: Retrieve a list of shops that belong to the given category ID.
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the category
 *     responses:
 *       200:
 *         description: A list of shops under the category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Shop ID
 *                   name:
 *                     type: string
 *                     description: Shop name
 *                   address:
 *                     type: string
 *                     description: Shop address
 *                   totalItem:
 *                     type: number
 *                     description: Total items in shop
 *                   totalPrice:
 *                     type: number
 *                     description: Total price of items
 *       400:
 *         description: Error retrieving shops by category
 */

router.get('/shop/:categoryId', async (req, res) => {
    try {
        // Lấy categoryId từ params
        const { categoryId } = req.params;
        // Gọi hàm getShopOwnerByCategoryId từ controller
        const result = await ControllerShopCategory.getShopOwnerByCategoryId(categoryId);
        res.status(200).json({status: true, data: result});
    } catch (error) {
        console.log('Error in getting shops by category:', error.message);

        // Trả về lỗi
        res.status(400).json({
            status: false,
            message: error.message
        });
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

/**
 * @swagger
 * /shops/search:
 *   get:
 *     summary: Get all shops by keyword or query
 *     tags: [Shop]
 *     description: Retrieve a list of shops that match the given keyword or query in the category name.
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: false
 *         description: Keyword to search in the category name
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: false
 *         description: Query to search in the category name
 *     responses:
 *       200:
 *         description: A list of shops matching the keyword or query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Shop ID
 *                   name:
 *                     type: string
 *                     description: Shop name
 *                   address:
 *                     type: string
 *                     description: Shop address
 *                   phone:
 *                     type: string
 *                     description: Shop phone
 *                   rating:
 *                     type: number
 *                     description: Shop rating
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                       description: Shop images
 *       400:
 *         description: Error retrieving shops by keyword or query
 */

router.get('/shops/search', async (req, res) => {
    try {
        // Lấy keyword và query từ query string
        const { keyword, query } = req.query;

        // Gọi hàm getShopOwnerByKeywordOrQuery từ controller
        const result = await ControllerShopCategory.getShopOwnerByShopCategory(keyword, query);
        res.status(200).json({ status: true, data: result });
    } catch (error) {
        console.log('Error in getting shops by keyword or query:', error.message);

        // Trả về lỗi
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
});

module.exports = router;