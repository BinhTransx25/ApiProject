const ModelShopCategory = require('./ModelShopCategory');
const ModelShopOwner = require('../../shopowner/ModelShopOwner');

// lấy tất cả danh mục Shop 
const getAllCategories = async () => {
    try {
        // Sử dụng phương thức find() của ModelCategory để lấy tất cả các danh mục

        const categories = await ModelShopCategory.find({}, 'name image');
        // Trả về danh sách các danh mục đã lấy được
        return categories;
    } catch (error) {
        console.log('Get all categories error:', error);
        throw new Error('Get all categories error');
    }
};
// lấy danh mục Shop theo id 
const getCategoryById = async (id) => {
    try {
        // Sử dụng phương thức findById() của ModelCategory để lấy danh mục theo id
        const category = await ModelShopCategory.findById(id, 'name image');

        // Kiểm tra nếu không tìm thấy danh mục
        if (!category) {
            throw new Error('Category not found');
        }

        // Trả về danh mục đã lấy được
        return category;
    } catch (error) {
        console.log('Get category by id error:', error);
        throw new Error('Get category by id error');
    }
};
// Hàm lấy các shop theo category_id
const getShopOwnerByCategoryId = async (categoryId) => {
    try {

        // Tìm tất cả shop có shopCategory_id trùng với categoryId
        const shops = await ModelShopOwner
        .find(
            {'shopCategory.shopCategory_id': categoryId,})
            .select('name address phone rating images distance');  // Chỉ chọn những field cần thiết

        // Nếu không có shop nào thuộc danh mục đó
        if (!shops || shops.length === 0) {
            throw new Error('No shops found for this category');
        }

        // Trả về thông tin của danh mục và danh sách các shop
        return shops;
    } catch (error) {
        console.log('Get shops by category id error:', error);
        throw new Error('Get shops by category id error');
    }
};
// thêm một danh mục shop 1
const insert = async (name, image,) => {
    try {
        // kiểm tra danh mục có tồn tại không
        // select * from categories where _id = category_id

        // tạo sản phẩm mới
        const categories = new ModelShopCategory({
            name,
            image
        });
        // lưu sản phẩm
        let result = await categories.save();
        return result;
    } catch (error) {
        console.log('Insert product error:', error);
        throw new Error('Insert product error');
    }
};

// cập nhật sản phẩm theo id
const update = async (id, name, image) => {
    try {
        // kiểm tra sản phẩm theo id có tồn tại không
        // select * from products where _id = id
        const productInDB = await ModelShopCategory.findById(id);
        if (!productInDB) {
            throw new Error('Product not found');
        }
        // kiểm tra danh mục có tồn tại không
        // select * from categories where _id = category_id
        // const categoryInDB = await ModelCategory.findById(category_id);
        // if (!categoryInDB) {
        //     throw new Error('Category not found');
        // }
        // cập nhật sản phẩm
        productInDB.name = name || productInDB.name; // nếu name không có thì giữ nguyên giá trị cũ
        productInDB.image = image || productInDB.image;

        // lưu sản phẩm
        let result = await productInDB.save();
        return result;
    } catch (error) {
        console.log('Update product error:', error);
        throw new Error('Update product error');
    }
};

// xóa sản phẩm theo id
const remove = async (id) => {
    try {
        // kiểm tra sản phẩm theo id có tồn tại không
        // select * from products where _id = id
        const productInDB = await ModelShopCategory.findById(id);
        if (!productInDB) {
            throw new Error('Product not found');
        }
        // xóa sản phẩm
        let result = await ModelShopCategory.findByIdAndDelete(id);
        return result;
    } catch (error) {
        console.log('Remove product error:', error);
        throw new Error('Remove product error');
    }
};

module.exports = {  insert, update, remove, getAllCategories, getCategoryById, getShopOwnerByCategoryId }