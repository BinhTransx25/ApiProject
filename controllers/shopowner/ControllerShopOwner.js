const ModelShopCategory = require("../categories/ShopCategory/ModelShopCategory");
const ModelShopOwner = require("./ModelShopOwner");
const ModelOrder = require('../order/ModelOrder');
const ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcryptjs');

// Lấy thông tin tất cả các nhà hàng
const getAllShopOwners = async () => {
    try {
        // Lọc các nhà hàng đang ở trạng thái 'Mở cửa' và chưa bị xóa
        return await ModelShopOwner.find({ status: 'Mở cửa', isDeleted: false });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin tất cả các cửa hàng đang mở cửa:', error);
        throw new Error('Lỗi khi lấy thông tin tất cả các cửa hàng đang mở cửa');
    }
};
// Lấy thông tin tất cả các nhà hàng
const getAllShopOwnersNormal = async () => {
    try {
        // Lọc các nhà hàng đang ở trạng thái 'Mở cửa' và chưa bị xóa
        return await ModelShopOwner.find();
    } catch (error) {
        console.error('Lỗi khi lấy thông tin tất cả các cửa hàng đang mở cửa:', error);
        throw new Error('Lỗi khi lấy thông tin tất cả các cửa hàng đang mở cửa');
    }
};

// Lấy thông tin nhà hàng theo ID
const getShopOwnerById = async (id) => {
    try {
        const shopowner = await ModelShopOwner.findById(id)
        if (!shopowner) {
            throw new Error('Nhà hàng not found');
        }
        return shopowner;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin nhà hàng theo ID:', error);
        throw new Error('Lỗi khi lấy thông tin nhà hàng theo ID');
    }
};

// Cập nhật thông tin nhà hàng
const updateShopOwner = async (id, name, phone, email, address, rating, images, openingHours, closeHours, imageVerified, latitude, longitude) => {
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
        shopOwnerInDB.openingHours = openingHours || shopOwnerInDB.openingHours;
        shopOwnerInDB.closeHours = closeHours || shopOwnerInDB.closeHours;
        shopOwnerInDB.latitude = latitude || shopOwnerInDB.latitude;
        shopOwnerInDB.longitude = longitude || shopOwnerInDB.longitude;
        // Xử lý cập nhật imageVerified
        if (imageVerified) {
            if (Array.isArray(imageVerified)) {
                // Nếu imageVerified là mảng, cập nhật trực tiếp
                shopOwnerInDB.imageVerified = imageVerified || shopOwnerInDB.imageVerified;
            } else {
                // Nếu imageVerified là chuỗi, chuyển thành mảng
                shopOwnerInDB.imageVerified = [imageVerified] || shopOwnerInDB.imageVerified;
            }
        }

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
//(Không dùng nữa)
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

// Hàm thay đổi trạng thái yêu thích (Không dùng nữa)
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

// Hàm lấy danh sách cửa hàng yêu thích (Không dùng nữa)
const getFavoriteShops = async () => {
    try {
        const favoriteShops = await ModelShopOwner.find({ favorite: true });
        return favoriteShops;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách cửa hàng yêu thích:', error);
        throw new Error('Lỗi khi lấy danh sách cửa hàng yêu thích');
    }
};

// Lấy doanh thu của shop theo ngày, tuần, tháng
const getRevenueByShopOwner = async (shopOwnerId, date, filter) => {
    try {
        // Chuyển shopOwnerId thành ObjectId nếu cần thiết
        const shopOwnerObjectId = new ObjectId(shopOwnerId);

        // Khai báo biến để lưu trữ khoảng thời gian bắt đầu và kết thúc
        let startDate, endDate;

        // Xác định khoảng thời gian dựa trên giá trị của filter
        if (filter === 'day') {
            startDate = new Date(new Date(date).setUTCHours(0, 0, 0, 0)); // Thời điểm bắt đầu ngày
            endDate = new Date(new Date(date).setUTCHours(23, 59, 59, 999)); // Thời điểm kết thúc ngày
        } else if (filter === 'week') {
            const startOfWeek = new Date(date);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getUTCDay());
            startDate = new Date(startOfWeek.setUTCHours(0, 0, 0, 0)); // Thời điểm bắt đầu tuần

            endDate = new Date(startOfWeek); // Tạo một đối tượng Date mới từ startOfWeek
            endDate.setDate(endDate.getDate() + 6); // Cộng thêm 6 ngày để có ngày Thứ Bảy
            endDate.setUTCHours(23, 59, 59, 999); // Thiết lập giờ cho endDate
        } else if (filter === 'month') {
            const startOfMonth = new Date(date);
            startDate = new Date(startOfMonth.getUTCFullYear(), startOfMonth.getUTCMonth(), 1, 0, 0, 0, 0); // Thời điểm bắt đầu tháng
            endDate = new Date(startOfMonth.getUTCFullYear(), startOfMonth.getUTCMonth() + 1, 0, 23, 59, 59, 999); // Thời điểm kết thúc tháng
        } else {
            throw new Error("Filter không hợp lệ. Chỉ chấp nhận 'day', 'week', 'month'.");
        }

        // Tìm các đơn hàng của shopOwner trong khoảng thời gian xác định và có isDeleted: false
        const orders = await ModelOrder.find({
            'shopOwner._id': shopOwnerObjectId, // Lọc theo shopOwnerId
            orderDate: { $gte: startDate, $lte: endDate }, // Lọc theo ngày đặt hàng
            isDeleted: false, // Chỉ lấy các order chưa bị xóa
            status: { $nin: [
                'Đang xử lý', 
                'Chờ thanh toán', 
                'Nhà hàng hủy đơn', 
                'Tài xế hủy đơn', 
                'Khách hủy đơn', 
                'Đơn hàng tạm xóa'
            ]} // Loại trừ những trạng thái không mong muốn
        }).sort({ orderDate: -1 });

        // Tính toán các giá trị tổng hợp
        const totalOrders = orders.length; // Tổng số đơn hàng
        let cashTotal = 0; // Tổng doanh thu bằng tiền mặt
        let appTotal = 0; // Tổng doanh thu qua ứng dụng
        let shippingfeeTotal = 0;

        orders.forEach(order => {
            if (order.paymentMethod === 'Tiền mặt') {
                cashTotal += order.totalPrice; // Cộng doanh thu từ đơn hàng thanh toán bằng tiền mặt
            } else {
                appTotal += order.totalPrice; // Cộng doanh thu từ đơn hàng thanh toán qua ứng dụng
            }

            if (order.shippingfee != null) {
                shippingfeeTotal += order.shippingfee; // Cộng doanh thu từ shippingfee
            }
        });

        // Tính tổng doanh thu
        const totalRevenue = cashTotal + appTotal;

        // Trả về kết quả
        return {
            startDate: startDate,
            endDate: endDate,
            totalOrders: totalOrders,
            totalRevenue: totalRevenue,
            cashTotal: cashTotal,
            appTotal: appTotal,
            shippingfeeTotal: shippingfeeTotal,
            orders: orders // Danh sách đơn hàng
        };
    } catch (error) {
        console.error('Lỗi khi lấy doanh thu của cửa hàng:', error);
        throw new Error('Lỗi khi lấy doanh thu của hàng');
    }
};


// Lấy doanh thu của shop theo 1 khoảng thời gian nhất định
const getRevenueByShopOwnerCustomRange = async (shopOwnerId, startDateInput, endDateInput) => {
    try {
        // Chuyển `shopOwnerId` thành ObjectId nếu cần thiết
        const shopOwnerObjectId = new ObjectId(shopOwnerId);

        // Kiểm tra và chuyển đổi ngày nhập vào thành đối tượng Date
        const startDate = new Date(startDateInput);
        const endDate = new Date(endDateInput);

        // Kiểm tra tính hợp lệ của khoảng thời gian
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error("Ngày không hợp lệ. Vui lòng nhập ngày theo định dạng hợp lệ (yyyy-mm-dd).");
        }

        // Đảm bảo `endDate` luôn là cuối ngày
        endDate.setUTCHours(23, 59, 59, 999);

        // Tìm các đơn hàng của shopOwner trong khoảng thời gian xác định và không bị xóa
        const orders = await ModelOrder.find({
            'shopOwner._id': shopOwnerObjectId, // Lọc theo shopOwnerId
            orderDate: { $gte: startDate, $lte: endDate }, // Lọc theo ngày đặt hàng
            isDeleted: false, // Chỉ lấy các order chưa bị xóa
            status: { $nin: [
                'Đang xử lý', 
                'Chờ thanh toán', 
                'Nhà hàng hủy đơn', 
                'Tài xế hủy đơn', 
                'Khách hủy đơn', 
                'Đơn hàng tạm xóa'
            ]} // Loại trừ những trạng thái không mong muốn
        }).sort({ orderDate: -1 });

        // Tính toán các giá trị tổng hợp
        const totalOrders = orders.length; // Tổng số đơn hàng
        let cashTotal = 0; // Tổng doanh thu bằng tiền mặt
        let appTotal = 0; // Tổng doanh thu qua ứng dụng

        // Duyệt qua từng đơn hàng để tính doanh thu
        orders.forEach(order => {
            if (order.paymentMethod === 'Tiền mặt') {
                cashTotal += order.shippingfee; // Cộng doanh thu từ đơn hàng thanh toán bằng tiền mặt
            } else {
                appTotal += order.shippingfee; // Cộng doanh thu từ đơn hàng thanh toán qua ứng dụng
            }
        });

        // Tính tổng doanh thu
        const totalRevenue = cashTotal + appTotal;

        // Trả về kết quả
        return {
            startDate: startDate, // Ngày bắt đầu
            endDate: endDate, // Ngày kết thúc
            totalOrders: totalOrders, // Tổng số đơn hàng
            totalRevenue: totalRevenue, // Tổng doanh thu
            cashTotal: cashTotal, // Tổng doanh thu bằng tiền mặt
            appTotal: appTotal, // Tổng doanh thu qua ứng dụng
            orders: orders // Danh sách đơn hàng
        };
    } catch (error) {
        // Ghi log lỗi nếu có
        console.error('Lỗi khi lấy doanh thu của shopOwner:', error);
        // Ném ra lỗi cho hàm gọi
        throw new Error('Lỗi khi lấy doanh thu của shopOwner');
    }
};


// Đổi mật khẩu
const changePassword = async (email, oldPassword, newPassword) => {
    try {
        // Tìm admin theo email
        const shopownerInDB = await ModelShopOwner.findOne({ email });
        if (!shopownerInDB) {
            throw new Error('Email không tồn tại');
        }

        // Kiểm tra mật khẩu cũ
        if (shopownerInDB.password) {
            // Nếu mật khẩu đã được băm
            const checkPassword = await bcrypt.compare(oldPassword, shopownerInDB.password);
            if (!checkPassword) {
                throw new Error('Mật khẩu không đúng');
            }
        }

        // Băm mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        shopownerInDB.password = await bcrypt.hash(newPassword, salt);

        // Lưu mật khẩu mới vào cơ sở dữ liệu
        await shopownerInDB.save();

        return { message: 'Password changed successfully' };
    } catch (error) {
        console.error('Error changing password:', error);
        throw new Error(error);
    }
};

// Cập nhật shopCategory cho một shop owner
const updateShopCategory = async (shopOwnerId, shopCategory_ids) => {
    try {
        // Tìm cửa hàng theo ID
        const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerId);
        if (!shopOwnerInDB) {
            throw new Error("Không tìm thấy cửa hàng");
        }
        let shopCategories = [];
        for (const shopCategory_id of shopCategory_ids) {
            const categoryInDB = await ModelShopCategory.findById(shopCategory_id);
            if (!categoryInDB) {
                throw new Error('Category not found');
            }
            shopCategories.push({
                shopCategory_id: categoryInDB._id,
                shopCategory_name: categoryInDB.name
            });
        }

        // Cập nhật danh sách shopCategory
        shopOwnerInDB.shopCategory = shopCategories || shopOwnerInDB.shopCategory;

        // Lưu thay đổi
        let result = await shopOwnerInDB.save();
        return result;
    } catch (error) {
        console.error("Lỗi khi cập nhật shopCategory:", error);
        throw new Error("Không thể cập nhật shopCategory");
    }
};

// Mở Trạng thái hoạt động của cửa hàng
const changeShopOwnerStatusOpen = async (id) => {
    try {
        return await ModelShopOwner.findByIdAndUpdate(
            id,
            { status: 'Mở cửa', updated_at: Date.now() },
            { new: true }
        );
    } catch (error) {
        console.error('Thay đổi trạng thái thất bại', error);
        throw new Error('Thay đổi trạng thái thất bại');
    }
};

// Tắt Trạng thái hoạt động của cửa hàng
const changeShopOwnerStatusClosed = async (id) => {
    try {
        return await ModelShopOwner.findByIdAndUpdate(
            id,
            { status: 'Đóng cửa', updated_at: Date.now() },
            { new: true }
        );
    } catch (error) {
        console.error('Thay đổi trạng thái thất bại', error);
        throw new Error('Thay đổi trạng thái thất bại');
    }
};

// Khóa Trạng thái hoạt động của cửa hàng
const changeShopOwnerStatusUnactive = async (id) => {
    try {
        return await ModelShopOwner.findByIdAndUpdate(
            id,
            { status: 'Ngưng hoạt động', updated_at: Date.now() },
            { new: true }
        );
    } catch (error) {
        console.error('Thay đổi trạng thái thất bại', error);
        throw new Error('Thay đổi trạng thái thất bại');
    }
};

//  Xác thực shop
const changeShopOwnerVerified = async (id) => {
    try {
        // Lấy thông tin shopOwner theo ID
        const shopowner = await ModelShopOwner.findById(id);

        if (!shopowner) {
            throw new Error('Không tìm thấy shopowner');
        }

        // Kiểm tra nếu cột imageVerified không có hình ảnh thì từ chối cập nhật
        if (!shopowner.imageVerified || shopowner.imageVerified.length === 0) {
            throw new Error('Không thể xác thực shopowner vì chưa có hình ảnh xác thực');
        }

        // Cập nhật cột verified thành true 
        return await ModelShopOwner.findByIdAndUpdate(
            id,
            { verified: true, updated_at: Date.now() },
            { new: true }
        );
    } catch (error) {
        console.error('Thay đổi xác thực thất bại', error);
        throw new Error(error.message || 'Lỗi khi xác thực shopowner');
    }
};

// Cập nhật sản phẩm thành xóa mềm và chuyển trạng thái thành 'Tài khoản bị khóa'
const removeSoftDeleted = async (id) => {
    try {
        const shopownerInDB = await ModelShopOwner.findById(id);
        if (!shopownerInDB) {
            throw new Error('ShopOwner not found');
        }

        // Cập nhật trạng thái isDeleted và status
        let result = await ModelShopOwner.findByIdAndUpdate(
            id,
            { isDeleted: true, status: 'Tài khoản bị khóa' },
            { new: true } // Trả về document đã cập nhật
        );
        return result;
    } catch (error) {
        console.log('Remove ShopOwner error:', error);
        throw new Error('Remove ShopOwner error');
    }
};

// Khôi phục trạng thái cho shop 
const restoreAndSetAvailable = async (id) => {
    try {
        const shopownerInDB = await ModelShopOwner.findById(id);
        if (!shopownerInDB) {
            throw new Error('ShopOwner not found');
        }

        // Cập nhật trạng thái
        const result = await ModelShopOwner.findByIdAndUpdate(
            id,
            { isDeleted: false, status: 'Mở cửa' },
            { new: true } // Trả về document đã cập nhật
        );
        return result;
    } catch (error) {
        console.log('Restore ShopOwner error:', error);
        throw new Error('Restore ShopOwner error');
    }
};



module.exports = {
    getAllShopOwners,
    getShopOwnerById,
    updateShopOwner,
    deleteShopOwner,
    searchShopOwner,
    toggleFavorite,
    getFavoriteShops,
    getRevenueByShopOwner,
    changePassword,
    updateShopCategory,
    changeShopOwnerStatusOpen,
    changeShopOwnerStatusClosed,
    changeShopOwnerStatusUnactive,
    changeShopOwnerVerified,
    getRevenueByShopOwnerCustomRange,
    removeSoftDeleted,
    restoreAndSetAvailable,
    getAllShopOwnersNormal

};
