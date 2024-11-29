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
                'name price categories description images shopOwner soldOut')
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

const searchProductsAndShops = async (keyword) => {
    try {
        const results = []; // Kết quả tìm kiếm cửa hàng sẽ được lưu ở đây.

        // **Tìm kiếm sản phẩm có tên khớp với từ khóa**
        const products = await ModelProduct.find({
            name: { $regex: keyword, $options: 'i' } // Sử dụng biểu thức regex để tìm kiếm không phân biệt chữ hoa, chữ thường.
        })
        .populate({
            path: 'shopOwner.shopOwner_id', // Tham chiếu đến shopOwner từ sản phẩm.
            model: 'shopOwner', // Model tương ứng trong MongoDB.
            select: 'name images address rating distance latitude longitude status' // Lấy thông tin cần thiết từ shopOwner.
        })
        .exec(); // Thực thi câu lệnh truy vấn.

        // **Nhóm các cửa hàng có sản phẩm khớp với từ khóa**
        const shopMap = {}; // Để gom nhóm các cửa hàng có sản phẩm khớp.

        products.forEach(product => {
            const shopId = product.shopOwner.shopOwner_id._id; // Lấy ID của shop từ sản phẩm.
            
            // Nếu shop chưa có trong `shopMap`, khởi tạo một nhóm mới.
            if (!shopMap[shopId]) {
                shopMap[shopId] = {
                    shopId, // ID của cửa hàng.
                    name: product.shopOwner.shopOwner_name, // Tên cửa hàng.
                    images: product.shopOwner.images, // Ảnh của cửa hàng.
                    address: product.shopOwner.address, // Địa chỉ cửa hàng.
                    rating: product.shopOwner.rating, // Đánh giá của cửa hàng.
                    distance: product.shopOwner.distance, // Khoảng cách từ khách hàng đến cửa hàng.
                    latitude: product.shopOwner.latitude, // Vĩ độ cửa hàng.
                    longitude: product.shopOwner.longitude, // Kinh độ cửa hàng.
                    status: product.shopOwner.status, // Trạng thái cửa hàng.
                };
            }
        });

        // Chuyển các nhóm shop từ `shopMap` thành mảng để thêm vào kết quả.
        for (const shopId in shopMap) {
            results.push(shopMap[shopId]);
        }

        // **Tìm kiếm cửa hàng có tên khớp với từ khóa (không cần sản phẩm)** 
        const shops = await ModelShopOwner.find({
            name: { $regex: keyword, $options: 'i' } // Tìm kiếm các cửa hàng theo từ khóa.
        });

        // Thêm thông tin từng cửa hàng vào kết quả.
        shops.forEach(shop => {
            // Nếu cửa hàng này không có sản phẩm khớp, bỏ qua
            if (!results.some(result => result.shopId.toString() === shop._id.toString())) {
                results.push({
                    shopId: shop._id, // ID cửa hàng.
                    name: shop.name, // Tên cửa hàng.
                    rating: shop.rating, // Đánh giá của cửa hàng.
                    address: shop.address, // Địa chỉ cửa hàng.
                    images: shop.images, // Ảnh của cửa hàng.
                    distance: shop.distance, // Khoảng cách từ khách hàng đến cửa hàng.
                    latitude: shop.latitude, // Vĩ độ cửa hàng.
                    longitude: shop.longitude, // Kinh độ cửa hàng.
                    status: shop.status, // Trạng thái cửa hàng.
                });
            }
        });

        // **Tạo danh sách gợi ý từ cửa hàng**
        const suggestions = shops.map(shop => ({
            name: shop.name, // Tên cửa hàng.
            image: shop.images?.[0] || '', // Ảnh đại diện cửa hàng.
            rating: shop.rating, // Đánh giá cửa hàng.
            type: 'shop', // Loại: cửa hàng.
            shopId: shop._id // ID cửa hàng.
        }));

        // **Trả về kết quả**
        return {
            results,       // Kết quả tìm kiếm đầy đủ (cửa hàng có sản phẩm khớp với từ khóa)
            suggestions    // Gợi ý nhanh (danh sách cửa hàng)
        };

    } catch (error) {
        console.error('Search error:', error); // In lỗi ra console.
        throw new Error('Search error'); // Ném lỗi để xử lý bên ngoài.
    }
};





module.exports = {
    getAllProducts, getProductById, insert, update,
    remove, getAllProducts, getProductsByCategory,
    getProductsByShopOwner, getProductsByCategoryAndShopOwner
    , searchProductsAndShops
};
