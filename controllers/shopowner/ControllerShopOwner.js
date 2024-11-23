const ModelShopCategory = require("../categories/ShopCategory/ModelShopCategory");
const ModelShopOwner = require("./ModelShopOwner");
const ModelOrder = require('../order/ModelOrder');
const ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcryptjs');

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
        const shopowner = await ModelShopOwner.findById(id, 'name phone email shopCategory address rating countReview images distance')

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

const getRevenueByShopOwner = async (shopOwnerId, date, filter) => {
    try {
        // Chuyển `shipperId` thành ObjectId nếu cần thiết
        const shopOwnerObjectId = new ObjectId(shopOwnerId);

        // Khai báo biến để lưu trữ khoảng thời gian bắt đầu và kết thúc
        let startDate, endDate;

        // Xác định khoảng thời gian dựa trên giá trị của `filter`
        if (filter === 'day') {
            // Nếu filter là 'day', lấy đầu ngày và cuối ngày
            startDate = new Date(new Date(date).setUTCHours(0, 0, 0, 0)); // Thời điểm bắt đầu ngày
            endDate = new Date(new Date(date).setUTCHours(23, 59, 59, 999)); // Thời điểm kết thúc ngày
        } else if (filter === 'week') {
            // Nếu filter là 'week', lấy ngày đầu tuần (Chủ nhật) và cuối tuần (Thứ Bảy)
            const startOfWeek = new Date(date);
            // Lấy ngày Chủ nhật của tuần đó
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getUTCDay());
            startDate = new Date(startOfWeek.setUTCHours(0, 0, 0, 0)); // Thời điểm bắt đầu tuần
            
            // Tạo một đối tượng Date mới từ startOfWeek để tính ngày Thứ Bảy
            endDate = new Date(startOfWeek); // Tạo một đối tượng Date mới từ startOfWeek
            endDate.setDate(endDate.getDate() + 6); // Cộng thêm 6 ngày để có ngày Thứ Bảy
            endDate.setUTCHours(23, 59, 59, 999); // Thiết lập giờ cho endDate
        } else if (filter === 'month') {
            // Nếu filter là 'month', lấy ngày đầu và cuối tháng
            const startOfMonth = new Date(date);
            // Thời điểm bắt đầu tháng
            startDate = new Date(startOfMonth.getUTCFullYear(), startOfMonth.getUTCMonth(), 1, 0, 0, 0, 0);
            // Thời điểm kết thúc tháng
            endDate = new Date(startOfMonth.getUTCFullYear(), startOfMonth.getUTCMonth() + 1, 0, 23, 59, 59, 999);
        } else {
            // Nếu filter không hợp lệ, ném ra lỗi
            throw new Error("Filter không hợp lệ. Chỉ chấp nhận 'day', 'week', 'month'.");
        }

        // Tìm các đơn hàng của shipper trong khoảng thời gian xác định
        const orders = await ModelOrder.find({
            'shopOwner._id': shopOwnerObjectId, // Lọc theo shipperId
            orderDate: { $gte: startDate, $lte: endDate } // Lọc theo ngày đặt hàng
        }).sort({ orderDate: -1 });

        // Tính toán các giá trị tổng hợp
        const totalOrders = orders.length; // Tổng số đơn hàng
        let cashTotal = 0; // Tổng doanh thu bằng tiền mặt
        let appTotal = 0; // Tổng doanh thu qua ứng dụng
        let shippingfeeTotal = 0;

        // Duyệt qua từng đơn hàng để tính doanh thu
        orders.forEach(order => {
            if (order.paymentMethod === 'Tiền mặt') {
                cashTotal += order.totalPrice; // Cộng doanh thu từ đơn hàng thanh toán bằng tiền mặt
            } else {
                appTotal += order.totalPrice; // Cộng doanh thu từ đơn hàng thanh toán qua ứng dụng
            }
        });

         // Duyệt qua từng đơn hàng để tính shippingfee
         orders.forEach(order => {
            if (order.shippingfee != null) {
                shippingfeeTotal += order.shippingfee; // Cộng doanh thu từ đơn hàng thanh toán bằng tiền mặt
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
            shippingfeeTotal: shippingfeeTotal,
            orders: orders // Danh sách đơn hàng
        };
    } catch (error) {
        // Ghi log lỗi nếu có
        console.error('Lỗi khi lấy doanh thu của cửa hàng:', error);
        // Ném ra lỗi cho hàm gọi
        throw new Error('Lỗi khi lấy doanh thu của hàng');
    }
};

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
          throw new Error('Tài khoản hoặc mật khẩu không đúng');
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
      throw new Error('Error changing password');
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
    changePassword
};
