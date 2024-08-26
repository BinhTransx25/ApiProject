var express = require('express');
var router = express.Router();
const ControllerShopCategory = require('../controllers/categories/ShopCategory/ControllerShopCategory')

// http://localhost:9999/shopCategories


/**
 * Get all categories
 * method: GET
 * url: http://localhost:9999/shopCategories
 * response: danh sách tất cả các danh mục
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
 * Get category by id
 * method: GET
 * url: http://localhost:9999/shopCategories/:id
 * response: thông tin của danh mục cụ thể
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
 * Insert product
 * method: POST
 * url: http://localhost:9999/shopCategories
 * body: { name, description }
 * example:
 * response: sản phẩm mới
 * author: nguyen van anh
 * date: 17/09/2021
 */
router.post('/', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const shopCategories = await ControllerShopCategory.insert(name,  description);
        return res.status(200).json({ status: true, data: shopCategories });
    } catch (error) {
        console.log('Insert product error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});


/**
 * Cập nhật sản phẩm theo id
 * method: PUT
 * url: http://localhost:9999/shopCategories/:id
 * body: { name,   description }
 * example:
 * response: sản phẩm mới
 */
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name,  description } = req.body;
        const shopCategories = await ControllerShopCategory.update(id, name,  description);
        return res.status(200).json({ status: true, data: shopCategories });
    } catch (error) {
        console.log('Update product error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});


/**
 * Xóa sản phẩm theo id
 * method: DELETE
 * url: http://localhost:9999/shopCategories/:id
 * response: { status: true }
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
