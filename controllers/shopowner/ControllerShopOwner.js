const ModelShopCategory = require("../categories/ShopCategory/ModelShopCategory");
const ModelShopOwner = require("./ModelShopOwner");

// Lấy thông tin tất cả các nhà hàng
const getAllShopOwners = async () => {
    try {
        return await ModelShopOwner.find();
    } catch (error) {
        console.error('Lỗi khi lấy thông tin tất cả các cửa hàng:', error);
        throw new Error('Lỗi khi lấy thông tin tất cả các cửa hàng');
    }
};

// Lấy thông tin nhà hàng theo ID
const getShopOwnerById = async (id) => {
    try {
        const shipper = await ModelShopOwner.findById(id, 'name phone email shopCategory address rating countReview images distance')

        if (!shipper) {
            throw new Error('Nhà hàng not found');
        }
        return shipper;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin nhà hàng theo ID:', error);
        throw new Error('Lỗi khi lấy thông tin nhà hàng theo ID');
    }
};

// Cập nhật thông tin nhà hàng
const updateShopOwner = async (id, name, phone, email, address, rating, images) => {
    try {

        const shopOwnerInDB = await ModelShopOwner.findById(id);
        if (!shopOwnerInDB) {
            throw new Error('Không Tìm Thấy Cửa Hàng, Hãy thử lại');
        }
        shopOwnerInDB.name = name || shopOwnerInDB.name;
        shopOwnerInDB.phone = phone || shopOwnerInDB.phone;
        shopOwnerInDB.email = email || shopOwnerInDB.email;
        shopOwnerInDB.address = address || shopOwnerInDB.address;
        shopOwnerInDB.images = images || shopOwnerInDB.images;
        shopOwnerInDB.password = rating || shopOwnerInDB.password;

        let result = await shopOwnerInDB.save();
        return result;
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin cửa hàng:', error);
        throw new Error('Lỗi khi cập nhật thông tin cửa hàng');
    }
};

// Xóa nhà hàng
const deleteShopOwner = async (id) => {
    try {
        return await ModelShopOwner.findByIdAndDelete(id);
    } catch (error) {
        console.error('Lỗi khi xóa shipper:', error);
        throw new Error('Lỗi khi xóa shipper');
    }
};

const searchShopOwner = async (keyword) => {
    try {
        const shops = await ModelShopOwner.find({ name: { $regex: keyword, $options: 'i' } });
        const categories = await ModelShopCategory.find({ name: { $regex: keyword, $options: 'i' } });
        const suggetions = [
            ...shops.map(shop => ({ ...shop.toObject(), type: 'shop' })),
            ...categories.map(category => ({ ...category.toObject(), type: 'category' }))
        ]
        return suggetions;
    } catch (error) {
        console.error('Lỗi khi tìm kiếm cửa hàng:', error);
        throw new Error('Lỗi khi tìm kiếm cửa hàng');
    }
};

// Hàm thay đổi trạng thái yêu thích
const toggleFavorite = async (shopOwnerId) => {
    try {
        const shop = await ModelShopOwner.findById(shopOwnerId);
        if (!shop) {
            throw new Error('Shop not found');
        }

        // Đổi trạng thái favorite
        shop.favorite = !shop.favorite;
        await shop.save();

        return {
            message: `Favorite status changed to ${shop.favorite}`,
            shop
        };
    } catch (error) {
        console.error('Lỗi khi thay đổi trạng thái yêu thích:', error);
        throw new Error('Lỗi khi thay đổi trạng thái yêu thích');
    }
};

// Hàm lấy danh sách cửa hàng yêu thích
const getFavoriteShops = async () => {
    try {
        const favoriteShops = await ModelShopOwner.find({ favorite: true });
        return favoriteShops;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách cửa hàng yêu thích:', error);
        throw new Error('Lỗi khi lấy danh sách cửa hàng yêu thích');
    }
};

module.exports = {
    getAllShopOwners,
    getShopOwnerById,
    updateShopOwner,
    deleteShopOwner,
    searchShopOwner,
    toggleFavorite,
    getFavoriteShops
};
