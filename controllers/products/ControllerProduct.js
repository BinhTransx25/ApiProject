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
            .find(query, 'name price categories description images shopOwner rating soldOut status isDeleted')
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
        const sort = { soldOut: -1 };

        const products = await ModelProduct
            .find(
                { 'categories.categoryProduct_id': category_id },
                'name price categories description images shopOwner rating soldOut status isDeleted')
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
        let sort = { soldOut: -1 };

        const products = await ModelProduct
            .find(
                { 'shopOwner.shopOwner_id': shopOwner_id },
                'name price categories description images shopOwner rating soldOut status isDeleted')
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
            .find(query, 'name price categories description images shopOwner rating soldOut status isDeleted')
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
                    categoryProduct_id: categoryInDB._id,
                    categoryProduct_name: categoryInDB.name
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
        if (images) {
            if (Array.isArray(images)) {
                // Nếu imageVerified là mảng, cập nhật trực tiếp
                productInDB.images = images;
            } else {
                // Nếu imageVerified là chuỗi, chuyển thành mảng
                productInDB.images = [images];
            }
        }
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

// tìm sản phẩm theo từ khóa 
const searchProductsAndShops = async (keyword) => {
    try {
        const results = []; // Kết quả tìm kiếm sản phẩm và cửa hàng.

        // **Tìm kiếm sản phẩm có tên khớp với từ khóa**
        const products = await ModelProduct.find({
            name: { $regex: keyword, $options: 'i' }, // Tìm kiếm không phân biệt chữ hoa, chữ thường.
            status: 'Còn món' // Chỉ tìm sản phẩm đang còn món.
        })
            .select('name price images shopOwner status') // Chọn thêm trường status để lọc.
            .populate({
                path: 'shopOwner.shopOwner_id', // Liên kết đến bảng shopOwner.
                model: 'shopOwner',
                match: { status: 'Mở cửa' }, // Chỉ lấy thông tin của các cửa hàng mở cửa.
                select: 'name images rating address shopCategory countReview openingHours closeHours status distance latitude longitude', // Thông tin cần thiết.
            });

        // **Nhóm các sản phẩm theo từng cửa hàng**
        const shopMap = {}; // Gom nhóm các sản phẩm theo cửa hàng.
        products.forEach(product => {
            const shop = product.shopOwner?.shopOwner_id; // Lấy thông tin cửa hàng từ sản phẩm.

            if (shop) {
                if (!shopMap[shop._id]) {
                    shopMap[shop._id] = {
                        shopId: shop._id,
                        name: shop.name,
                        rating: shop.rating,
                        address: shop.address,
                        images: shop.images,
                        shopCategories: shop.shopCategory?.map(category => ({
                            id: category.shopCategory_id?._id || category.shopCategory_id,
                            name: category.shopCategory_name,
                            description: category.shopCategory_id?.description || '',
                        })) || [],
                        countReview: shop.countReview || 0,
                        openingHours: shop.openingHours || '08:00',
                        closeHours: shop.closeHours || '20:00',
                        status: shop.status || 'Open',
                        distance: shop.distance || 'N/A',
                        latitude: shop.latitude,
                        longitude: shop.longitude,
                        product: [] // Danh sách sản phẩm thuộc cửa hàng.
                    };
                }

                // Thêm sản phẩm vào nhóm của cửa hàng nếu trạng thái sản phẩm không phải "Ngừng bán".
                if (product.status !== 'Ngừng bán') {
                    shopMap[shop._id].product.push({
                        name: product.name,
                        price: product.price,
                        image: product.images?.[0] || '',
                        product_id: product._id,
                    });
                }
            }
        });

        // Thêm các nhóm cửa hàng vào kết quả.
        for (const shopId in shopMap) {
            results.push(shopMap[shopId]);
        }

        // **Tìm kiếm cửa hàng có tên khớp với từ khóa**
        const shops = await ModelShopOwner.find({
            name: { $regex: keyword, $options: 'i' },
            status: 'Mở cửa' // Chỉ tìm cửa hàng đang mở cửa.
        })
            .select('name rating address images shopCategory countReview openingHours closeHours status distance latitude longitude')
            .populate({
                path: 'shopCategory.shopCategory_id',
                select: 'name description',
            });

        // **Đưa thông tin cửa hàng vào kết quả tìm kiếm**
        shops.forEach(shop => {
            if (!shopMap[shop._id]) { // Tránh thêm trùng lặp cửa hàng đã tồn tại trong shopMap.
                results.push({
                    shopId: shop._id,
                    name: shop.name,
                    rating: shop.rating,
                    address: shop.address,
                    images: shop.images,
                    shopCategories: shop.shopCategory?.map(category => ({
                        id: category.shopCategory_id?._id || category.shopCategory_id,
                        name: category.shopCategory_name,
                        description: category.shopCategory_id?.description || '',
                    })) || [],
                    countReview: shop.countReview || 0,
                    openingHours: shop.openingHours || '08:00',
                    closeHours: shop.closeHours || '20:00',
                    status: shop.status || 'Open',
                    distance: shop.distance || 'N/A',
                    latitude: shop.latitude,
                    longitude: shop.longitude,
                    product: [] // Cửa hàng không có sản phẩm.
                });
            }
        });

        // Nếu không tìm thấy sản phẩm hoặc cửa hàng nào
        if (products.length === 0 && shops.length === 0) {
            return {
                results: [],
                suggestions: []
            };
        }

        // **Tạo danh sách gợi ý từ sản phẩm và cửa hàng**
        const suggestions = [
            ...products
                .filter(product => product.status === 'Còn món') // Chỉ gợi ý sản phẩm còn món.
                .map(product => ({
                    name: product.name,
                    image: product.images?.[0] || '',
                    price: product.price,
                    type: 'product',
                    product_id: product._id
                })),
            ...shops.map(shop => ({
                name: shop.name,
                image: shop.images?.[0] || '',
                rating: shop.rating,
                type: 'shop',
                shopId: shop._id
            }))
        ];

        // **Trả về kết quả**
        return {
            results,       // Kết quả tìm kiếm (cửa hàng và sản phẩm của cửa hàng).
            suggestions    // Gợi ý nhanh (danh sách nhanh sản phẩm và cửa hàng).
        };

    } catch (error) {
        console.error('Search error:', error); // In lỗi ra console.
        throw new Error('Search error'); // Ném lỗi để xử lý bên ngoài.
    }
};

// Cập nhật sản phẩm thành xóa mềm và chuyển trạng thái thành 'Ngừng bán'
const removeSoftDeleted = async (id) => {
    try {
        const productInDB = await ModelProduct.findById(id);
        if (!productInDB) {
            throw new Error('Product not found');
        }

        // Cập nhật trạng thái isDeleted và status
        let result = await ModelProduct.findByIdAndUpdate(
            id,
            { isDeleted: true, status: 'Ngừng bán' },
            { new: true } // Trả về document đã cập nhật
        );
        return result;
    } catch (error) {
        console.log('Remove product error:', error);
        throw new Error('Remove product error');
    }
};

// Chuyển trạng thái thành còn món 
const restoreAndSetAvailable = async (id) => {
    try {
        const productInDB = await ModelProduct.findById(id);
        if (!productInDB) {
            throw new Error('Product not found');
        }

        // Cập nhật trạng thái
        const result = await ModelProduct.findByIdAndUpdate(
            id,
            { isDeleted: false, status: 'Còn món' },
            { new: true } // Trả về document đã cập nhật
        );
        return result;
    } catch (error) {
        console.log('Restore product error:', error);
        throw new Error('Restore product error');
    }
};

// Chuyển trạng thái thành hết món 
const restoreAndSetOutOfStock = async (id) => {
    try {
        const productInDB = await ModelProduct.findById(id);
        if (!productInDB) {
            throw new Error('Product not found');
        }

        // Cập nhật trạng thái
        const result = await ModelProduct.findByIdAndUpdate(
            id,
            { isDeleted: false, status: 'Hết món' },
            { new: true } // Trả về document đã cập nhật
        );
        return result;
    } catch (error) {
        console.log('Restore product to out of stock error:', error);
        throw new Error('Restore product to out of stock error');
    }
};





module.exports = {
    getAllProducts,
    getProductById, 
    insert, update,
    remove, getAllProducts, 
    getProductsByCategory,
    getProductsByShopOwner, 
    getProductsByCategoryAndShopOwner, 
    searchProductsAndShops,
    removeSoftDeleted,
    restoreAndSetAvailable,
    restoreAndSetOutOfStock

};
