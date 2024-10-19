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
const updateShopOwner = async (id, name, phone, email, address, rating, image) => {
    try {

        const shopOwnerInDB = await ModelShopOwner.findById(id);
        if (!shopOwnerInDB) {
            throw new Error('Không Tìm Thấy Cửa Hàng, Hãy thử lại');
        }
        shopOwnerInDB.name = name || shipperInDB.name;
        shopOwnerInDB.phone = phone || shipperInDB.phone;
        shopOwnerInDB.email = email || shipperInDB.email;
        shopOwnerInDB.address = address || shipperInDB.address;
        shopOwnerInDB.image = image || shipperInDB.image;
        shopOwnerInDB.password = rating || shipperInDB.password;

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

module.exports = {
    getAllShopOwners,
    getShopOwnerById,
    updateShopOwner,
    deleteShopOwner
};
