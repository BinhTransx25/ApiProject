var express = require('express');
var router = express.Router();
const ControllerProductCategory = require('../controllers/categories/ProductCategory/ControllerProductCategory');
const validator = require('../middlewares/Validation');

/**
 * Get all category products
 * method: GET
 * url: http://localhost:9999/category-products?page=1&limit=10&keyword=example
 * response: danh sách các sản phẩm trong danh mục
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
 * Get all categories
 * method: GET
 * url: http://localhost:9999/category-products/categories
 * response: danh sách tất cả các danh mục
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
 * Get category by id
 * method: GET
 * url: http://localhost:9999/category-products/:id
 * response: thông tin của danh mục cụ thể
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
 * Get productCategory by shop_ID
 * method: GET
 * url: http://localhost:9999/productCategories/shopOwner/:id ?page=1&limit=10
 * response: thông tin của danh mục theo shop id 
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
 * Insert category product
 * method: POST
 * url: http://localhost:9999/category-products
 * body: { name, description }
 * response: danh mục sản phẩm mới
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
 * Update category product by id
 * method: PUT
 * url: http://localhost:9999/category-products/:id
 * body: { name, description }
 * response: danh mục sản phẩm đã cập nhật
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
 * Delete category product by id
 * method: DELETE
 * url: http://localhost:9999/category-products/:id
 * response: trạng thái xoá danh mục
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let result = await ControllerProductCategory.remove(id);
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        console.log('Remove category product error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

module.exports = router;
