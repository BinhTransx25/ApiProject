const Shipper = require('../shipper/ModelShipper');

// Thêm shipper mới
const addShipper = async (name, phone, email, address) => {
    try {
        const newShipper = new Shipper({ name, phone, email, address });
        return await newShipper.save();
    } catch (error) {
        console.error('Lỗi khi thêm shipper:', error);
        throw new Error('Lỗi khi thêm shipper');
    }
};

// Lấy thông tin tất cả các shipper
const getAllShippers = async () => {
    try {
        return await Shipper.find();
    } catch (error) {
        console.error('Lỗi khi lấy thông tin tất cả các shipper:', error);
        throw new Error('Lỗi khi lấy thông tin tất cả các shipper');
    }
};

// Lấy thông tin shipper theo ID
const getShipperById = async (id) => {
    try {
        return await Shipper.findById(id).populate('assignedOrders');
    } catch (error) {
        console.error('Lỗi khi lấy thông tin shipper theo ID:', error);
        throw new Error('Lỗi khi lấy thông tin shipper theo ID');
    }
};

// Cập nhật thông tin shipper
const updateShipper = async (id, updateData) => {
    try {
        updateData.updated_at = Date.now();
        return await Shipper.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin shipper:', error);
        throw new Error('Lỗi khi cập nhật thông tin shipper');
    }
};

// Xóa shipper
const deleteShipper = async (id) => {
    try {
        return await Shipper.findByIdAndDelete(id);
    } catch (error) {
        console.error('Lỗi khi xóa shipper:', error);
        throw new Error('Lỗi khi xóa shipper');
    }
};

// Cập nhật vị trí hiện tại của shipper
const updateShipperLocation = async (id, coordinates) => {
    try {
        return await Shipper.findByIdAndUpdate(
            id,
            { currentLocation: { type: 'Point', coordinates }, updated_at: Date.now() },
            { new: true }
        );
    } catch (error) {
        console.error('Lỗi khi cập nhật vị trí shipper:', error);
        throw new Error('Lỗi khi cập nhật vị trí shipper');
    }
};

// Xác nhận shipper
const confirmShipper = async (id) => {
    try {
        return await Shipper.findByIdAndUpdate(
            id,
            { status: 'active', updated_at: Date.now() },
            { new: true }
        );
    } catch (error) {
        console.error('Lỗi khi xác nhận shipper:', error);
        throw new Error('Lỗi khi xác nhận shipper');
    }
};

// Hủy shipper
const cancelShipper = async (id) => {
    try {
        return await Shipper.findByIdAndUpdate(
            id,
            { status: 'inactive', updated_at: Date.now() },
            { new: true }
        );
    } catch (error) {
        console.error('Lỗi khi hủy shipper:', error);
        throw new Error('Lỗi khi hủy shipper');
    }
};

module.exports = {
    addShipper,
    getAllShippers,
    getShipperById,
    updateShipper,
    deleteShipper,
    updateShipperLocation,
    confirmShipper,
    cancelShipper
};
