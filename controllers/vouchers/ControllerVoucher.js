const Voucher = require('./ModelVouher');

// Thêm voucher mới
const createVoucher = async (code, discountAmount, minimumOrderAmount, expirationDate, image) => {
    
    try {
        const voucher = new Voucher({code, discountAmount, minimumOrderAmount, expirationDate, image});
        await voucher.save();
        return voucher
    } catch (error) {
        console.error("Error creating voucher:", error);
        throw new Error('Error when adding Voucher');    }
};

// Lấy tất cả voucher
const getAllVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find();
        return vouchers
    } catch (error) {
        console.error("Error fetching vouchers:", error);
        return res.status(500).json({ status: false, error: error.message });
    }
};

// Lấy những voucher khả dụng theo tổng tiền đơn hàng
const getAvailableVouchers = async (orderTotal) => {
    try {
        const now = new Date();
        const vouchers = await Voucher.find({
            status: 'khả dụng',
            expirationDate: { $gt: now },
            minimumOrderAmount: { $lte: orderTotal }
        }).sort({ discountAmount: -1 }); // Sắp xếp theo discountAmount từ cao xuống thấp
        return vouchers
    } catch (error) {
        console.error("Lỗi khi lấy voucher khả dụng:", error);
        throw new Error('Lỗi khi lấy voucher khả dụng');

    }
};

// Lấy voucher theo ID
const getVoucherById = async (id) => {
    try {
        const voucher = await Voucher.findById(id);
        return voucher
    } catch (error) {
        console.error("Error fetching voucher by ID:", error);
        throw new Error('Lỗi khi lấy voucher theo id');
    }
};

// Xóa voucher theo ID
const deleteVoucher = async ( id ) => {
    try {
        const deletedVoucher = await Voucher.findByIdAndDelete(id);
        return deletedVoucher
    } catch (error) {
        console.error("Error deleting voucher:", error);
        throw new Error('Lỗi khi xóa voucher theo id');
    }
};

// Cập nhật sản phẩm thành xóa mềm và chuyển trạng thái thành 'Ngừng bán'
const removeSoftDeleted = async (id) => {
    try {
        const VoucherInDB = await Voucher.findById(id);
        if (!VoucherInDB) {
            throw new Error('Voucher not found');
        }

        // Cập nhật trạng thái isDeleted và status
        let result = await Voucher.findByIdAndUpdate(
            id,
            { isDeleted: true, status: 'không khả dụng' },
            { new: true } // Trả về document đã cập nhật
        );
        return result;
    } catch (error) {
        console.log('Remove product error:', error);
        throw new Error('Remove product error');
    }
};

const restoreAndSetAvailable = async (id) => {
    try {
        const VoucherInDB = await Voucher.findById(id);
        if (!VoucherInDB) {
            throw new Error('Voucher not found');
        }

        // Cập nhật trạng thái isDeleted và status
        let result = await Voucher.findByIdAndUpdate(
            id,
            { isDeleted: false, status: 'khả dụng' },
            { new: true } // Trả về document đã cập nhật
        );
        return result;
    } catch (error) {
        console.log('Remove product error:', error);
        throw new Error('Remove product error');
    }
};

// Xuất các phương thức
module.exports = {
    createVoucher,
    getAllVouchers,
    getAvailableVouchers,
    getVoucherById,
    deleteVoucher,
    removeSoftDeleted,
    restoreAndSetAvailable

};
