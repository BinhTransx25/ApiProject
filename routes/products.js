var express = require('express');
var router = express.Router();
const ControllerProduct = require('../controllers/products/ControllerProduct');


// Lấy tất cả sản phẩm
//http://localhost:9999/products/all?page=1&limit=10&keyword=example
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

// Lấy sản phẩm theo id
// http://localhost:9999/products/12345

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

// Lấy tất cả sản phẩm theo loại
// http://localhost:9999/products/category/660e9691b1fab899ecfa7a85?page=1&limit=10

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
// Lấy tất cả sản phẩm theo shopOwner
// http://localhost:9999/products/shop/67890?page=1&limit=10

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

// Lấy tất cả sản phẩm theo điều kiện categoryId và shopOwnerId
// http://localhost:9999/products?categoryId=660e9691b1fab899ecfa7a85&shopOwnerId=67890&keyword=example&page=1&limit=10

router.get('/filter', async function (req, res, next) {
    try {
        const categoryId = req.params.id;
        const shopOwnerId = req.params.id;
        const page = req.query.page;
        const limit = req.query.limit;
       
        const products = await ControllerProduct.getProductsByCategoryAndShopOwner(categoryId, shopOwnerId, page, limit);
        return res.status(200).json({ status: true, data: products });
    } catch (error) {
        console.log('Get products error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});
// Thêm sản phẩm

router.post('/', async (req, res, next) => {
    try {
        const { name, price, quantity, images, categories, description, shopOwner } = req.body;
        const product = await ControllerProduct.insert(name, price, quantity, images, description, categories, shopOwner);
        return res.status(200).json({ status: true, data: product });
    } catch (error) {
        console.log('Insert product error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

// Cập nhật sản phẩm theo id và shopOwner
router.put('/update/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, price, quantity, images, category, description } = req.body;
        const product = await ControllerProduct.update(id, name, price, quantity, images, description );
        return res.status(200).json({ status: true, data: product });
    } catch (error) {
        console.log('Update product error:', error);
        return res.status(500).json({ status: false, error: error });
    }
});

// Xóa sản phẩm theo id và shopOwner
// http://localhost:9999/products/12345

// Route xử lý xóa sản phẩm
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        let result = await ControllerProduct.remove(id);
        if (!result) {
            return res.status(404).json({ status: false, error: 'Product not found' });
        }
        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        console.log('Remove product error:', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

module.exports = router;