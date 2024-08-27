const ModelUser = require('../users/ModelUser');
const ModelAddress = require('./ModelAddress');
const ObjectId = require('mongoose').Types.ObjectId

// Thêm địa chỉ mới
const addAddress = async (recipientName, address, email, phone,) => {
    try {
        let newAddress = new ModelAddress({ recipientName, address, email, phone });
        await newAddress.save();
        return newAddress;
    } catch (error) {
        console.log('Error in addAddress:', error);
        throw new Error('Error when adding address');
    }
};
// Mới thêm
const addAddress2 = async (recipientName, address, phone, user) => {
    try {
        let userInDB = await ModelUser.findById(user)
        console.log(userInDB);
        (userInDB);
        if (!userInDB) {
            throw new Error('User not found');
        }
        user = {
            _id: userInDB._id,
            email: userInDB.email,
        }
        let newAddress = new ModelAddress({ recipientName, address, phone, user });
        await newAddress.save();
        setTimeout(async() => {
            let data = {
                address: newAddress.address,
                phone: newAddress.phone,
                name: newAddress.name,
            }
            userInDB.address.push(data);
            await userInDB.save();
        }, 0);
        return newAddress;
    } catch (error) {
        console.log('Error in addAddress:', error);
        throw new Error('Error when adding address');
    }
};

const getAddressByUser = async (user) => {
    try {
        const userInDB = await ModelUser.findById(user);
        if (!userInDB) {
            throw new Error('User not found');
        }
        let addresses = await ModelAddress.find({ 'user._id': new ObjectId(user) });
        return addresses;
    } catch (error) {
        console.log('Error in getAddressByUser:', error);
        throw new Error('Error when fetching addresses');
    }
}

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

module.exports = { addAddress, getAllAddresses, getAddressById, updateAddress, deleteAddress, addAddress2, getAddressByUser };
