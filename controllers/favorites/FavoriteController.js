const Favorite = require('./FavoriteModel');

const addFavorite = async (userId, shopId) => {
    try {
        // Kiểm tra xem đã tồn tại yêu thích này chưa
        const existingFavorite = await Favorite.findOne({ userId, shopId });
        if (existingFavorite) {
            throw new Error('Shop này đã được yêu thích trước đó');
        }

        const favorite = new Favorite({ userId, shopId });
        await favorite.save();
        return favorite;
    } catch (error) {
        throw new Error(error.message);
    }
};
 
const getFavoritesByUser = async (userId) => {
    try {
        const favorites = await Favorite.find({ userId }).populate('shopId');
        return favorites;
    } catch (error) {
        throw new Error('Lỗi khi lấy danh sách yêu thích');
    }
};

const removeFavorite = async (userId, shopId) => {
    try {
        const result = await Favorite.findOneAndDelete({ userId, shopId });
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
    removeFavorite
};