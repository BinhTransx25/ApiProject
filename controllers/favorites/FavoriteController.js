const Favorite = require('./FavoriteModel');
const User = require('../users/ModelUser');
const ShopOwner = require('../shopowner/ModelShopOwner');

const addFavorite = async (userId, shopOwnerId) => {
    try {
        // Kiểm tra xem đã tồn tại yêu thích này chưa
        const existingFavorite = await Favorite.findOne({ 'user._id': userId, 'shopOwner._id': shopOwnerId });
        if (existingFavorite) {
            throw new Error('Cửa hàng này đã được yêu thích trước đó');
        }

        // Lấy thông tin người dùng
        const user = await User.findById(userId).select('name phone email image');
        
        // Lấy thông tin cửa hàng yêu thích
        const shopOwner = await ShopOwner.findById(shopOwnerId).select('name rating images address');

        const favorite = new Favorite({
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                image: user.image,
            },
            shopOwner: {
                _id: shopOwner._id,
                name: shopOwner.name,
                rating: shopOwner.rating,
                address: shopOwner.address,
                images: shopOwner.images,
            }
        });

        await favorite.save();

        return favorite;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getFavoritesByUser = async (userId) => {
    try {
        const favorites = await Favorite.find({ 'user._id': userId });
        return favorites;
    } catch (error) {
        throw new Error('Lỗi khi lấy danh sách yêu thích');
    }
};

const getFavoritesByShopId = async (shopOwnerId) => {
    try {
        const favorites = await Favorite.find({ 'shopOwner._id': shopOwnerId });
        return favorites;
    } catch (error) {
        throw new Error('Lỗi khi lấy danh sách yêu thích');
    }
};

const removeFavorite = async (userId, shopOwnerId) => {
    try {
        const result = await Favorite.findOneAndDelete({ 'user._id': userId, 'shopOwner._id': shopOwnerId });
        if (!result) {
            throw new Error('Không tìm thấy yêu thích để xóa');
        }
        return result;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    addFavorite,
    getFavoritesByUser,
    removeFavorite,
    getFavoritesByShopId,
};
