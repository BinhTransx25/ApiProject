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

        // Lấy thông tin cửa hàng yêu thích
        const shopOwner = await ShopOwner.findById(shopOwnerId).select('name rating images address status');
        
        if (!shopOwner) {
            throw new Error('Cửa hàng không tồn tại');
        }

        // Kiểm tra trạng thái của nhà hàng
        if (!['Mở cửa', 'Đóng cửa'].includes(shopOwner.status)) {
            throw new Error('Cửa hàng này không đủ điều kiện để thêm vào danh sách yêu thích');
        }

        // Lấy thông tin người dùng
        const user = await User.findById(userId).select('name phone email image');
        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        // Tạo yêu thích mới
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
        // Tìm các mục yêu thích không bị xóa mềm
        const favorites = await Favorite.find({ 'user._id': userId, isDeleted: false });

        // Lọc những mục có trạng thái cửa hàng là "Mở cửa" hoặc "Đóng cửa"
        const filteredFavorites = await Promise.all(
            favorites.map(async (favorite) => {
                const shopOwner = await ShopOwner.findById(favorite.shopOwner._id).select('status');
                if (shopOwner && (shopOwner.status === 'Mở cửa' || shopOwner.status === 'Đóng cửa')) {
                    return favorite;
                }
                return null; // Không lấy nếu trạng thái cửa hàng không hợp lệ
            })
        );

        // Loại bỏ các giá trị null khỏi danh sách
        return filteredFavorites.filter((favorite) => favorite !== null);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu thích:', error);
        throw new Error('Lỗi khi lấy danh sách yêu thích');
    }
};


const getFavoritesByShopId = async (shopOwnerId) => {
    try {
        // Tìm các mục yêu thích không bị xóa mềm
        const favorites = await Favorite.find({ 'shopOwner._id': shopOwnerId, isDeleted: false });

        // Lọc những mục có trạng thái người dùng hợp lệ
        const filteredFavorites = await Promise.all(
            favorites.map(async (favorite) => {
                const user = await User.findById(favorite.user._id).select('status');
                if (user && (user.status === 'Hoạt động')) {
                    return favorite;
                }
                return null; // Không lấy nếu trạng thái người dùng không hợp lệ
            })
        );

        // Loại bỏ các giá trị null khỏi danh sách
        return filteredFavorites.filter((favorite) => favorite !== null);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu thích:', error);
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

// Cập nhật sản phẩm thành xóa mềm và chuyển trạng thái thành 'Tài khoản bị khóa'
const removeSoftDeleted = async (id) => {
    try {
        const favouriteInDB = await Favorite.findById(id);
        if (!favouriteInDB) {
            throw new Error('Favorite not found');
        }
  
        // Cập nhật trạng thái isDeleted và status
        let result = await Favorite.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true } // Trả về document đã cập nhật
        );
        return result;
    } catch (error) {
        console.log('Remove Favorite error:', error);
        throw new Error('Remove Favorite error');
    }
  };
  
  // Chuyển trạng thái
  const restoreAndSetAvailable = async (id) => {
    try {
        const favouriteInDB = await Favorite.findById(id);
        if (!favouriteInDB) {
            throw new Error('Favorite not found');
        }
  
        // Cập nhật trạng thái
        const result = await Favorite.findByIdAndUpdate(
            id,
            { isDeleted: false },
            { new: true } // Trả về document đã cập nhật
        );
        return result;
    } catch (error) {
        console.log('Restore Favorite error:', error);
        throw new Error('Restore Favorite error');
    }
  };

module.exports = {
    addFavorite,
    getFavoritesByUser,
    removeFavorite,
    getFavoritesByShopId,
    removeSoftDeleted,
    restoreAndSetAvailable
};
