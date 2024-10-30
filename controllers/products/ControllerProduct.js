const ModelProduct = require('./ModelProduct');
const ModelProductCategory = require('../categories/ProductCategory/ModelProductCategory');
const ModelShopOwner = require('../shopowner/ModelShopOwner')


// Lấy tất cả sản phẩm 
const getAllProducts = async (page, limit, keyword) => {
    try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        let skip = (page - 1) * limit;
        let sort = { create_at: -1 };
        let query = {};

        if (keyword) {
            query.name = { $regex: keyword, $options: 'i' };
        }

        let products = await ModelProduct
            .find(query, 'name price categories description images shopOwner')
            .skip(skip)
            .limit(limit)
            .sort(sort);
        return products;
    } catch (error) {
        console.log('Get all products error:', error);
        throw new Error('Get all products error');
    }
};

// Lấy sản phẩm theo id và shopOwner
const getProductById = async (id) => {
    try {
        const product = await ModelProduct.findById(id)
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    } catch (error) {
        console.log('Get product by id error:', error);
        throw new Error('Get product by id error');
    }
};
// Lấy tất cả sản phẩm theo loại
const getProductsByCategory = async (category_id, page, limit) => {
    try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;
        const sort = { create_at: -1 };

        const products = await ModelProduct
            .find(
                { 'categories.categoryProduct_id': category_id },
                'name price categories description images shopOwner')
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .exec();

        return products;
    } catch (error) {
        console.log('Get products by category error:', error);
        throw new Error('Get products by category error');
    }
};

// Lấy tất cả sản phẩm theo shopOwner
const getProductsByShopOwner = async (shopOwner_id, page, limit) => {
    try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        let skip = (page - 1) * limit;
        let sort = { create_at: -1 };

        const products = await ModelProduct
            .find(
                { 'shopOwner.shopOwner_id': shopOwner_id },
                'name price categories description images shopOwner')
            .skip(skip)
            .limit(limit)
            .sort(sort);
        console.log('Products:', products);
        return products;

    } catch (error) {
        console.log('Get products by shopOwner error:', error);
        throw new Error('Get products by shopOwner error');
    }
};

// Lấy tất cả sản phẩm theo loại và shopOwner
const getProductsByCategoryAndShopOwner = async (category_id, shopOwner_id, keyword, page, limit) => {
    try {
        page = parseInt(page, 10) || 1;
        limit = parseInt(limit, 10) || 10;
        const skip = (page - 1) * limit;
        const sort = { create_at: -1 };

        let query = {};
        if (category_id) {
            query['categories.categoryProduct_id'] = category_id;
        }
        if (shopOwner_id) {
            query['shopOwner.shopOwner_id'] = shopOwner_id;
        }
        if (keyword) {
            query.$or = [
                { name: new RegExp(keyword, 'i') },
                { description: new RegExp(keyword, 'i') }
            ];
        }

        const products = await ModelProduct
            .find(query, 'name pricecategories description images shopOwner')
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .exec();

        return products;
    } catch (error) {
        console.log('Get products error:', error);
        throw new Error('Get products error');
    }
};

// Thêm sản phẩm
const insert = async (name, price, images, description, category_ids, shopOwner_id, rating, soldOut) => {
    try {
        let categories = [];
        for (const category_id of category_ids) {
            const categoryInDB = await ModelProductCategory.findById(category_id);
            if (!categoryInDB) {
                throw new Error('Category not found');
            }
            categories.push({
                categoryProduct_id: categoryInDB._id,
                categoryProduct_name: categoryInDB.name
            });
        }

        const shopOwnerInDB = await ModelShopOwner.findById(shopOwner_id);
        if (!shopOwnerInDB) {
            throw new Error('Shop owner not found');
        }

        const product = new ModelProduct({
            name,
            price,
            images,
            description,
            categories,
            shopOwner: {
                shopOwner_id: shopOwnerInDB._id,
                shopOwner_name: shopOwnerInDB.name
            },
            rating,
            soldOut
        });

        let result = await product.save();
        return result;
    } catch (error) {
        console.log('Insert product error:', error);
        throw new Error('Insert product error');
    }
};

// Cập nhật sản phẩm theo id và shopOwner
const update = async (id, name, price, images, description, category_ids, shopOwner_id) => {
    try {
        const productInDB = await ModelProduct.findById(id);
        if (!productInDB) {
            throw new Error('Product not found');
        }

        let categories = [];
        if (category_ids) {
            for (const category_id of category_ids) {
                const categoryInDB = await ModelProductCategory.findById(category_id);
                if (!categoryInDB) {
                    throw new Error('Category not found');
                }
                categories.push({
                    category_id: categoryInDB._id,
                    category_name: categoryInDB.name
                });
            }
            productInDB.categories = categories;
        }

        if (shopOwner_id) {
            const shopOwnerInDB = await ModelShopOwner.findById(shopOwner_id);
            if (!shopOwnerInDB) {
                throw new Error('Shop owner not found');
            }
            productInDB.shopOwner = {
                shopOwner_id: shopOwnerInDB._id,
                shopOwner_name: shopOwnerInDB.name
            };
        }

        productInDB.name = name || productInDB.name;
        productInDB.price = price || productInDB.price;
        productInDB.images = images || productInDB.images;
        productInDB.description = description || productInDB.description;

        let result = await productInDB.save();
        return result;
    } catch (error) {
        console.log('Update product error:', error);
        throw new Error('Update product error');
    }
};

// Xóa sản phẩm theo id
const remove = async (id) => {
    try {
        const productInDB = await ModelProduct.findById(id);
        if (!productInDB) {
            throw new Error('Product not found');
        }
        let result = await ModelProduct.findByIdAndDelete(id);
        return result;
    } catch (error) {
        console.log('Remove product error:', error);
        throw new Error('Remove product error');
    }
};


module.exports = {
    getAllProducts, getProductById, insert, update,
    remove, getAllProducts, getProductsByCategory,
    getProductsByShopOwner, getProductsByCategoryAndShopOwner
};
