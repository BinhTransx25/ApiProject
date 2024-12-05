var express = require('express');
var router = express.Router();
const ControllerProduct = require('..//controllers/products/ControllerProduct');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API cho các sản phẩm
 */

/**
 * @swagger
 * /products/all:
 *   get:
 *     summary: Lấy tất cả sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Số trang
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Số lượng sản phẩm mỗi trang
 *         required: false
 *         schema:
 *           type: integer
 *       - name: keyword
 *         in: query
 *         description: Từ khóa tìm kiếm
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
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
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       quantity:
 *                         type: integer
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       description:
 *                         type: string
 */
router.get('/all', async function (req, res, next) {
    try {
        const page = req.query.page;
        const limit = req.query.limit;
        const keyword = req.query.keyword;
        const products = await ControllerProduct.getAllProducts(page, limit, keyword);
        return res.status(200).json({ status: true, data: products });
    } catch (error) {
        console.log('Get all products error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

router.get('/search', async function (req, res) {
    try {
        const { keyword } = req.query;

        // Kiểm tra từ khóa nhập vào
        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({
                status: false,
                error: 'Keyword is required'
            });
        }

        // Gọi hàm tìm kiếm trong Controller
        const { results = [], suggestions = [] } = await ControllerProduct.searchProductsAndShops(keyword.trim());

        // Nếu không tìm thấy kết quả
        if (results.length === 0 && suggestions.length === 0) {
            return res.status(200).json({
                status: true,
                message: 'No results or suggestions found',
                data: {
                    results,       // Kết quả tìm kiếm (chi tiết sản phẩm & cửa hàng)
                    suggestions    // Gợi ý (danh sách nhanh)
                }
            });
        }

        // Trả về kết quả
        return res.status(200).json({
            status: true,
            data: {
                results,       // Kết quả tìm kiếm (chi tiết sản phẩm & cửa hàng)
                suggestions    // Gợi ý (danh sách nhanh)
            }
        });
    } catch (error) {
        console.error('Search API error:', error);
        return res.status(500).json({
            status: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * /products/filter:
 *   get:
 *     summary: Lấy tất cả sản phẩm theo điều kiện categoryId và shopOwnerId
 *     tags: [Products]
 *     parameters:
 *       - name: categoryId
 *         in: query
 *         description: ID của loại sản phẩm
 *         required: false
 *         schema:
 *           type: string
 *       - name: shopOwnerId
 *         in: query
 *         description: ID của shopOwner
 *         required: false
 *         schema:
 *           type: string
 *       - name: keyword
 *         in: query
 *         description: Từ khóa tìm kiếm
 *         required: false
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Số trang
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Số lượng sản phẩm mỗi trang
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
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
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       quantity:
 *                         type: integer
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       description:
 *                         type: string
 */
router.get('/filter', async function (req, res, next) {
    try {
        const { categoryId, shopOwnerId, keyword, page, limit } = req.query;
        const products = await ControllerProduct.getProductsByCategoryAndShopOwner(categoryId, shopOwnerId, keyword, page, limit);
        return res.status(200).json({ status: true, data: products });
    } catch (error) {
        console.log('Get filtered products error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Lấy sản phẩm theo id
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID của sản phẩm
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
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
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: integer
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                     description:
 *                       type: string
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await ControllerProduct.getProductById(id); // Bỏ shopOwner
        return res.status(200).json({ status: true, data: product });
    } catch (error) {
        console.log('Get product by id error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /products/category/{id}:
 *   get:
 *     summary: Lấy tất cả sản phẩm theo loại
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID của loại sản phẩm
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Số trang
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Số lượng sản phẩm mỗi trang
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
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
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       quantity:
 *                         type: integer
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       description:
 *                         type: string
 */
router.get('/category/:id', async function (req, res, next) {
    try {
        const categoryId = req.params.id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const products = await ControllerProduct.getProductsByCategory(categoryId, page, limit);

        return res.status(200).json({ status: true, data: products });
    } catch (error) {
        console.log('Get products by category error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /products/shopOwner/{id}:
 *   get:
 *     summary: Lấy tất cả sản phẩm theo shopOwner
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID của shopOwner
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Số trang
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Số lượng sản phẩm mỗi trang
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
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
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       quantity:
 *                         type: integer
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       description:
 *                         type: string
 */
router.get('/shopOwner/:id', async function (req, res, next) {
    try {
        const shopOwnerId = req.params.id;
        const page = req.query.page;
        const limit = req.query.limit;

        const products = await ControllerProduct.getProductsByShopOwner(shopOwnerId, page, limit);
        return res.status(200).json({ status: true, data: products });
    } catch (error) {
        console.log('Get products by shopOwner error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

/**
 * @swagger
 * /products/add:
 *   post:
 *     summary: Thêm sản phẩm mới
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               shopOwnerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thêm sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Thông tin không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.post('/add', async (req, res, next) => {
    try {
        const { name, price, images, categories, description, shopOwner, rating, soldOut } = req.body;
        const product = await ControllerProduct.insert(name, price, images, description, categories, shopOwner, rating, soldOut);
        return res.status(200).json({ status: true, data: product });
    } catch (error) {
        console.log('Insert product error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

/**
 * @swagger
 * /products/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID của sản phẩm
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
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Không tìm thấy sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.put('/update/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, price, images, description, category_ids, shopOwner_id } = req.body; // Thêm category_ids và shopOwner_id vào body

        // Gọi Controller để cập nhật sản phẩm
        const product = await ControllerProduct.update(id, name, price, images, description, category_ids, shopOwner_id);

        return res.status(200).json({ status: true, data: product });
    } catch (error) {
        console.log('Update product error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /products/delete/{id}:
 *   delete:
 *     summary: Xóa sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID của sản phẩm
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Không tìm thấy sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.delete('/delete/:id', async function (req, res, next) {
    try {
        const productId = req.params.id;
        await ControllerProduct.remove(productId);
        return res.status(200).json({ status: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.log('Delete product error:', error);
        return res.status(404).json({ status: false, error: error.message });
    }
});

router.delete('/softdelete/:id', async function (req, res, next) {
    try {
        const productId = req.params.id;
        const updatedProduct = await ControllerProduct.removeSoftDeleted(productId);

        if (updatedProduct) {
            return res.status(200).json({
                status: true,
                message: 'Product successfully soft deleted',
                data: updatedProduct, // Trả về thông tin sản phẩm đã cập nhật
            });
        } else {
            return res.status(404).json({
                status: false,
                message: 'Product not found',
            });
        }
    } catch (error) {
        console.log('Delete product error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

router.put('/restore/available/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedProduct = await ControllerProduct.restoreAndSetAvailable(productId);

        return res.status(200).json({
            status: true,
            message: 'Product restored and set to available',
            data: updatedProduct,
        });
    } catch (error) {
        console.log('Restore product error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

router.put('/restore/out-of-stock/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedProduct = await ControllerProduct.restoreAndSetOutOfStock(productId);

        return res.status(200).json({
            status: true,
            message: 'Product restored and set to out of stock',
            data: updatedProduct,
        });
    } catch (error) {
        console.log('Restore product to out of stock error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

module.exports = router;
