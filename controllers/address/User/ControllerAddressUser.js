const UserAddress = require('../../models/UserAddress');

// Thêm địa chỉ mới cho user
const addUserAddress = async (userId, recipientName, address, latitude, longitude, email, phone) => {
    try {
        let newAddress = new UserAddress({ userId, recipientName, address, latitude, longitude, email, phone });
        await newAddress.save();
        return newAddress;
    } catch (error) {
        console.log('Error in addUserAddress:', error);
        throw new Error('Error when adding address');
    }
};

// Lấy tất cả địa chỉ của user
const getUserAddresses = async (userId) => {
    try {
        let addresses = await UserAddress.find({ userId });
        return addresses;
    } catch (error) {
        console.log('Error in getUserAddresses:', error);
        throw new Error('Error when fetching addresses');
    }
};

// Lấy địa chỉ theo ID
const getUserAddressById = async (id) => {
    try {
        let address = await UserAddress.findById(id);
        if (!address) {
            throw new Error('Address not found');
        }
        return address;
    } catch (error) {
        console.log('Error in getUserAddressById:', error);
        throw new Error('Error when fetching address');
    }
};

// Sửa địa chỉ của user
const updateUserAddress = async (id, recipientName, address, latitude, longitude, email, phone) => {
    try {
        let updatedAddress = await UserAddress.findByIdAndUpdate(id, { recipientName, address, latitude, longitude, email, phone }, { new: true });
        if (!updatedAddress) {
            throw new Error('Address not found');
        }
        return updatedAddress;
    } catch (error) {
        console.log('Error in updateUserAddress:', error);
        throw new Error('Error when updating address');
    }
};

// Xóa địa chỉ của user
const deleteUserAddress = async (id) => {
    try {
        let deletedAddress = await UserAddress.findByIdAndDelete(id);
        if (!deletedAddress) {
            throw new Error('Address not found');
        }
        return deletedAddress;
    } catch (error) {
        console.log('Error in deleteUserAddress:', error);
        throw new Error('Error when deleting address');
    }
};

module.exports = { addUserAddress, getUserAddresses, getUserAddressById, updateUserAddress, deleteUserAddress };
