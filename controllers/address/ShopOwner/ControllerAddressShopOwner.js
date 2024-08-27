const ShopAddress = require('../ShopOwner/ModelAddressShopOwner');

// Thêm địa chỉ mới cho shop
const addShopAddress = async (shopOwnerId, address, latitude, longitude) => {
    try {
        let newAddress = new ShopAddress({ shopOwnerId, address, latitude, longitude });
        await newAddress.save();
        return newAddress;
    } catch (error) {
        console.log('Error in addShopAddress:', error);
        throw new Error('Error when adding address');
    }
};

// Lấy tất cả địa chỉ của shop
const getShopAddresses = async (shopOwnerId) => {
    try {
        let addresses = await ShopAddress.find({ shopOwnerId });
        return addresses;
    } catch (error) {
        console.log('Error in getShopAddresses:', error);
        throw new Error('Error when fetching addresses');
    }
};

// Lấy địa chỉ của shop theo ID
const getShopAddressById = async (id) => {
    try {
        let address = await ShopAddress.findById(id);
        if (!address) {
            throw new Error('Address not found');
        }
        return address;
    } catch (error) {
        console.log('Error in getShopAddressById:', error);
        throw new Error('Error when fetching address');
    }
};

// Sửa địa chỉ của shop
const updateShopAddress = async (id, address, latitude, longitude) => {
    try {
        let updatedAddress = await ShopAddress.findByIdAndUpdate(id, { address, latitude, longitude }, { new: true });
        if (!updatedAddress) {
            throw new Error('Address not found');
        }
        return updatedAddress;
    } catch (error) {
        console.log('Error in updateShopAddress:', error);
        throw new Error('Error when updating address');
    }
};

// Xóa địa chỉ của shop
const deleteShopAddress = async (id) => {
    try {
        let deletedAddress = await ShopAddress.findByIdAndDelete(id);
        if (!deletedAddress) {
            throw new Error('Address not found');
        }
        return deletedAddress;
    } catch (error) {
        console.log('Error in deleteShopAddress:', error);
        throw new Error('Error when deleting address');
    }
};

module.exports = { addShopAddress, getShopAddresses, getShopAddressById, updateShopAddress, deleteShopAddress };
