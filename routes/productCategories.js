var express = require('express');
var router = express.Router();
const ControllerProductCategory = require('../controllers/categories/ProductCategory/ControllerProductCategory');

/**
 * @swagger
 * tags:
 *   name: ProductCategories
 *   description: API để quản lý danh mục sản phẩm
 */

/**
 * @swagger
 * /category-products:
 *   get:
 *     summary: Lấy tất cả danh mục sản phẩm
 *     tags: [ProductCategories]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Số trang để phân trang
 *         required: false
 *         type: integer
 *       - name: limit
 *         in: query
 *         description: Số lượng sản phẩm trên mỗi trang
 *         required: false
 *         type: integer
 *       - name: keyword
 *         in: query
 *         description: Từ khóa để tìm kiếm
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Danh sách các sản phẩm trong danh mục
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Lỗi khi lấy danh mục sản phẩm
 */
router.get('/', async (req, res, next) => {
    try {
        const page = req.query.page;
        const limit = req.query.limit;
        const keyword = req.query.keyword;
        const categories = await ControllerProductCategory.getAll(page, limit, keyword);
        return res.status(200).json({ status: true, data: categories });
    } catch (error) {
        console.log('Get all category products error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

/**
 * @swagger
 * /category-products/categories:
 *   get:
 *     summary: Lấy tất cả danh mục
 *     tags: [ProductCategories]
 *     responses:
 *       200:
 *         description: Danh sách tất cả các danh mục
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Lỗi khi lấy tất cả danh mục
 */
router.get('/categories', async (req, res, next) => {
    try {
        const categories = await ControllerProductCategory.getAllCategories();
        return res.status(200).json({ status: true, data: categories });
    } catch (error) {
        console.log('Get all categories error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /category-products/{id}:
 *   get:
 *     summary: Lấy thông tin của một danh mục theo ID
 *     tags: [ProductCategories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của danh mục
 *         type: string
 *     responses:
 *       200:
 *         description: Thông tin của danh mục
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Lỗi khi lấy danh mục theo ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await ControllerProductCategory.getCategoryById(id);
        return res.status(200).json({ status: true, data: category });
    } catch (error) {
        console.log('Get category by id error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

/**
 * @swagger
 * /productCategories/shopOwner/{id}:
 *   get:
 *     summary: Lấy danh mục sản phẩm theo shop ID
 *     tags: [ProductCategories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của chủ cửa hàng
 *         type: string
 *       - name: page
 *         in: query
 *         description: Số trang để phân trang
 *         required: false
 *         type: integer
 *       - name: limit
 *         in: query
 *         description: Số lượng sản phẩm trên mỗi trang
 *         required: false
 *         type: integer
 *     responses:
 *       200:
 *         description: Thông tin danh mục sản phẩm theo shop ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Lỗi khi lấy danh mục sản phẩm theo shop ID
 */
router.get('/shopOwner/:id', async function (req, res, next) {
    try {
        const shopOwnerId = req.params.id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const productCategories = await ControllerProductCategory.getProductsCategoriesByShopID(shopOwnerId, page, limit);

        return res.status(200).json({ status: true, data: productCategories });
    } catch (error) {
        console.log('Get productCategories by shop ID error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /category-products:
 *   post:
 *     summary: Thêm một danh mục sản phẩm mới
 *     tags: [ProductCategories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên danh mục
 *               description:
 *                 type: string
 *                 description: Mô tả danh mục
 *               shopOwner:
 *                 type: string
 *                 description: ID của chủ cửa hàng
 *     responses:
 *       200:
 *         description: Danh mục sản phẩm mới đã được thêm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Lỗi khi thêm danh mục sản phẩm
 */
router.post('/', async (req, res, next) => {
    try {
        const { name, description, shopOwner } = req.body;
        const productCategory = await ControllerProductCategory.insert(name, description, shopOwner);
        return res.status(200).json({ status: true, data: productCategory });
    } catch (error) {
        console.log('Insert category product error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

/**
 * @swagger
 * /category-products/{id}:
 *   put:
 *     summary: Cập nhật danh mục sản phẩm theo ID
 *     tags: [ProductCategories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của danh mục cần cập nhật
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên danh mục
 *               description:
 *                 type: string
 *                 description: Mô tả danh mục
 *     responses:
 *       200:
 *         description: Danh mục sản phẩm đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Lỗi khi cập nhật danh mục sản phẩm
 */
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const category = await ControllerProductCategory.update(id, name, description);
        return res.status(200).json({ status: true, data: category });
    } catch (error) {
        console.log('Update category product error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

/**
 * @swagger
 * /category-products/{id}:
 *   delete:
 *     summary: Xóa danh mục sản phẩm theo ID
 *     tags: [ProductCategories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của danh mục cần xóa
 *         type: string
 *     responses:
 *       200:
 *         description: Danh mục sản phẩm đã được xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *       500:
 *         description: Lỗi khi xóa danh mục sản phẩm
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await ControllerProductCategory.delete(id);
        return res.status(200).json({ status: true });
    } catch (error) {
        console.log('Delete category product error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

module.exports = router;
