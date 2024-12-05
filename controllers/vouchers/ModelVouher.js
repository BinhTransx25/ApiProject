const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoucherSchema = new Schema({
    code: { type: String, required: true, unique: true }, // Mã voucher
    discountAmount: { type: Number, required: true }, // Số tiền giảm giá cố định hoặc %
    minimumOrderAmount: { type: Number, required: true }, // Tổng tiền đơn hàng tối thiểu để sử dụng voucher
    expirationDate: { type: Date, required: true }, // Ngày hết hạn của voucher
    image: { type: String, required: true }, // URL hình ảnh của voucher
    status: { type: String, enum: ['khả dụng', 'không khả dụng', ], default: 'khả dụng' }, // Trạng thái voucher
    isDeleted:{type:Boolean, required:false, default:false},

}, { timestamps: true });

// Phương thức kiểm tra tính khả dụng của voucher
VoucherSchema.methods.isAvailable = function (orderTotal) {
    const now = new Date();
    return this.status === 'khả dụng' && // Kiểm tra trạng thái
        this.expirationDate > now && // Kiểm tra ngày hết hạn
        this.minimumOrderAmount <= orderTotal; // Kiểm tra tổng tiền đơn hàng
};

module.exports = mongoose.model('Voucher', VoucherSchema);
