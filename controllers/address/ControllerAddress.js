const ModelAddress = require('./ModelAddress');

// Thêm địa chỉ mới
const addAddress = async (recipientName, address, email, phone) => {
    try {
        let newAddress = new ModelAddress({ recipientName, address, email, phone });
        await newAddress.save();
        return newAddress;
    } catch (error) {
        console.log('Error in addAddress:', error);
        throw new Error('Error when adding address');
    }
};

// Lấy tất cả địa chỉ
const getAllAddresses = async () => {
    try {
        let addresses = await ModelAddress.find();
        return addresses;
    } catch (error) {
        console.log('Error in getAllAddresses:', error);
        throw new Error('Error when fetching addresses');
    }
};

// Lấy địa chỉ theo ID
const getAddressById = async (id) => {
    try {
        let address = await ModelAddress.findById(id);
        if (!address) {
            throw new Error('Address not found');
        }
        return address;
    } catch (error) {
        console.log('Error in getAddressById:', error);
        throw new Error('Error when fetching address');
    }
};

// Sửa địa chỉ
const updateAddress = async (id, recipientName, address, email, phone) => {
    try {
        let updatedAddress = await ModelAddress.findByIdAndUpdate(id, { recipientName, address, email, phone }, { new: true });
        if (!updatedAddress) {
            throw new Error('Address not found');
        }
        return updatedAddress;
    } catch (error) {
        console.log('Error in updateAddress:', error);
        throw new Error('Error when updating address');
    }
};

// Xóa địa chỉ
const deleteAddress = async (id) => {
    try {
        let deletedAddress = await ModelAddress.findByIdAndDelete(id);
        if (!deletedAddress) {
            throw new Error('Address not found');
        }
        return deletedAddress;
    } catch (error) {
        console.log('Error in deleteAddress:', error);
        throw new Error('Error when deleting address');
    }
};

module.exports = { addAddress, getAllAddresses, getAddressById, updateAddress, deleteAddress };
