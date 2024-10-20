const UserAddress = require('../User/ModelAddressUser');
const ModelUser = require('../../users/ModelUser');

// Thêm địa chỉ mới cho user
const addUserAddress = async (userId, recipientName, address, latitude, longitude, phone, label) => {

    if (!userId || !recipientName || !address || !phone) {
        const errorMessage = 'Missing required fields in request body';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    // Tạo biến coordinates từ latitude và longitude
    // const coordinates = {
    //     latitude: latitude,
    //     longitude: longitude
    // };

    try {
        let user = await ModelUser.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        let newAddress = new UserAddress({ userId, recipientName, address, latitude, longitude, phone, label });
        await newAddress.save();

        // Thêm địa chỉ mới vào danh sách address của người dùng
        user.address.push(newAddress);
        await user.save();


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
const updateUserAddress = async (id, recipientName, address, latitude, longitude, email, phone, label) => {
    try {
        let updatedAddress = await UserAddress.findByIdAndUpdate(id, { recipientName, address, latitude, longitude, phone, label }, { new: true });
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
