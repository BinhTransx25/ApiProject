const ModelUser = require('../users/ModelUser');
const ModelShopOwner = require('../shopowner/ModelShopOwner');
const ModelShipper = require('../shipper/ModelShipper');
const ModelAdmin = require('../admin/ModelAdmin');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendMail } = require('../../helpers/Mailer');

// Hàm đăng ký người dùng hoặc shop owner
const register = async (name, email, password, phone, image, role) => {
    try {
        // Kiểm tra email đã tồn tại trong hệ thống hay chưa
        let user = await ModelUser.findOne({ email });
        if (user) {
            throw new Error('Email đã được sử dụng');
        }
        let shopowner = await ModelShopOwner.find({ email });
        if (shopowner) {
            throw new Error('Email đã được sử dụng');
        }
        let shipper = await ModelShipper.find({ email });
        if (shipper) {
            throw new Error('Email đã được sử dụng');
        }

        // tạo một admin thông thường
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        admin = new ModelAdmin({ name, email, password, phone, image, role });
        await admin.save(); // Lưu người dùng vào cơ sở dữ liệu


        return true; // Trả về true nếu đăng ký thành công
    } catch (error) {
        console.error('Lỗi trong quá trình đăng ký:', error);
        throw new Error('Lỗi khi đăng ký người dùng');
    }
};

// Hàm đăng nhập người dùng hoặc shop owner
const login = async (identifier, password) => {
    try {
        // Tìm người dùng bằng email hoặc số điện thoại
        let admin = await ModelAdmin.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        // Nếu không tìm thấy người dùng, kiểm tra xem có phải shop owner không
        if (!admin) {
            throw new Error('Tài khoản hoặc mật khẩu không đúng');
        };


        // Kiểm tra mật khẩu người dùng
        const checkPassword = await bcrypt.compare(password, admin.password);
        if (!checkPassword) {
            throw new Error('Tài khoản hoặc mật khẩu không đúng');
        }

        // Tạo token JWT cho người dùng thông thường
        const token = jwt.sign(
            { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
            'secret',
            { expiresIn: '1h' }
        );

        // Trả về thông tin người dùng và token
        return { _id: admin._id, name: admin.name, email: admin.email, role: admin.role, phone: admin.phone, token, image: admin.image, password: admin.password };
    } catch (error) {
        console.error('Lỗi trong quá trình đăng nhập:', error);
        throw new Error('Lỗi khi đăng nhập người dùng');
    }
};

const resetPassword = async (email, password) => {
    try {
        const userInDB = await ModelUser.findOne({ email })
        if (!userInDB) {
            throw new Error('Email không tồn tại');
        }
        const salt = await bcrypt.genSalt(10)
        password = await bcrypt.hash(password, salt)
        await ModelUser.findByIdAndUpdate(userInDB._id, { password })
        return true
    } catch (error) {
        console.log('Error during reset password:', error);
        throw new Error('Lỗi khi đặt lại mật khẩu');
    }
}


// Cập nhật thông tin nhà hàng
const updateAdmin = async (id, name, phone, email, password, image) => {
    try {

        const adminInDB = await ModelAdmin.findById(id);
        if (!adminInDB) {
            throw new Error('Không Tìm Thấy Tài Khoản, Hãy thử lại');
        }
        adminInDB.name = name || adminInDB.name;
        adminInDB.phone = phone || adminInDB.phone;
        adminInDB.email = email || adminInDB.email;
        adminInDB.password = password || adminInDB.password;
        adminInDB.image = image || adminInDB.image;


        let result = await adminInDB.save();
        return result;
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin khách hàng:', error);
        throw new Error('Lỗi khi cập nhật thông tin khách hàng');
    }
};

// Lấy thông tin tất cả các nhà hàng
const getAllAdmin = async () => {
    try {
        return await ModelAdmin.find();
    } catch (error) {
        console.error('Lỗi khi lấy thông tin tất cả các admin:', error);
        throw new Error('Lỗi khi lấy thông tin tất cả các admin');
    }
};

// Lấy thông tin nhà hàng theo ID
const getAdminById = async (id) => {
    try {
        const admin = await ModelAdmin.findById(id, 'name phone email image')

        if (!admin) {
            throw new Error('User không tìm thấy');
        }
        return admin;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng theo ID:', error);
        throw new Error('Lỗi khi lấy thông tin người dùng theo ID');
    }
};

// Xóa User
const deleteAdmin = async (id) => {
    try {
        return await ModelAdmin.findByIdAndDelete(id);
    } catch (error) {
        console.error('Lỗi khi xóa admin:', error);
        throw new Error('Lỗi khi xóa admin');
    }
};

// Đổi mật khẩu
const changePassword = async (email, oldPassword, newPassword) => {
    try {
        // Tìm admin theo email
        const adminInDB = await ModelAdmin.findOne({ email });
        if (!adminInDB) {
            throw new Error('Email không tồn tại');
        }

        // Kiểm tra mật khẩu cũ
        if (adminInDB.password.startsWith('$2b$')) {
            // Nếu mật khẩu đã được băm
            const checkPassword = await bcrypt.compare(oldPassword, adminInDB.password);
            if (!checkPassword) {
                throw new Error('Tài khoản hoặc mật khẩu không đúng');
            }
        } else {
            // Nếu mật khẩu là plaintext
            if (adminInDB.password !== oldPassword) {
                throw new Error('Tài khoản hoặc mật khẩu không đúng');
            }
        }

        // Băm mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        adminInDB.password = await bcrypt.hash(newPassword, salt);

        // Lưu mật khẩu mới vào cơ sở dữ liệu
        await adminInDB.save();

        return { message: 'Password changed successfully' };
    } catch (error) {
        console.error('Error changing password:', error);
        throw new Error('Error changing password');
    }
};
module.exports = {
    register, login,
    resetPassword,
    updateAdmin, getAllAdmin, getAdminById, deleteAdmin, changePassword
};
