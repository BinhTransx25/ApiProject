// ControllerUser.js
const ModelUser = require('./ModelUser');
const ModelShopOwner = require('../shopowner/ModelShopOwner');
const ModelShopCategory = require('../categories/ShopCategory/ModelShopCategory');

const jwt = require('jsonwebtoken');

// Hàm đăng ký người dùng hoặc shop owner
const register = async (name, email, password, phone, role, shopCategory_id) => {
    try {
        // Kiểm tra email đã tồn tại trong hệ thống hay chưa
        let user = await ModelUser.findOne({ email });
        if (user) {
            throw new Error('Email đã được sử dụng');
        }

        // Nếu vai trò là shopOwner, tạo một shop owner mới
        if (role === 'shopOwner') {

            const shopCategoryInDB = await ModelShopCategory.findById(shopCategory_id);
            if (!shopCategoryInDB) {
                throw new Error('ShopCategory not found');
            }
            let shopOwner = new ModelShopOwner({
                name,
                email,
                password,
                phone,
                role,
                shopCategory:{
                    shopCategory_id: shopCategoryInDB._id,
                    shopCategory_name: shopCategoryInDB.name,

                } // Thêm thông tin danh mục cửa hàng cho shop owner
            });
            await shopOwner.save(); // Lưu shop owner vào cơ sở dữ liệu
        } else {
            // Nếu không phải shop owner, tạo một người dùng thông thường
            user = new ModelUser({ name, email, password, phone, role });
            await user.save(); // Lưu người dùng vào cơ sở dữ liệu
        }

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
        let user = await ModelUser.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        // Nếu không tìm thấy người dùng, kiểm tra xem có phải shop owner không
        if (!user) {
            let shopOwner = await ModelShopOwner.findOne({
                $or: [{ email: identifier }, { phone: identifier }]
            });

            // Nếu không tìm thấy shop owner, báo lỗi
            if (!shopOwner) {
                throw new Error('Không tồn tại tài khoản với thông tin này');
            }
            // Kiểm tra mật khẩu shop owner
            if (shopOwner.password.toString() !== password.toString()) {
                throw new Error('Mật khẩu không đúng');
            }

            // Tạo token JWT cho shop owner
            const token = jwt.sign(
                { _id: shopOwner._id, name: shopOwner.name, email: shopOwner.email, role: 'shopOwner', shopCategory: shopOwner.shopCategory },
                'secret', // Khóa bí mật để mã hóa token (cần thay thế bằng giá trị thực tế)
                { expiresIn: '1h' } // Token hết hạn sau 1 giờ
            );

            // Trả về thông tin shop owner và token
            return {
                _id: shopOwner._id,
                name: shopOwner.name,
                email: shopOwner.email,
                role: 'shopOwner',
                shopCategory: shopOwner.shopCategory, // Bao gồm thông tin danh mục cửa hàng
                token
            };
        }

        // Kiểm tra mật khẩu người dùng
        if (user.password.toString() !== password.toString()) {
            throw new Error('Mật khẩu không đúng');
        }

        // Tạo token JWT cho người dùng thông thường
        const token = jwt.sign(
            { _id: user._id, name: user.name, email: user.email, role: user.role },
            'secret', // Khóa bí mật để mã hóa token (cần thay thế bằng giá trị thực tế)
            { expiresIn: '1h' } // Token hết hạn sau 1 giờ
        );

        // Trả về thông tin người dùng và token
        return { _id: user._id, name: user.name, email: user.email, role: user.role, token };
    } catch (error) {
        console.error('Lỗi trong quá trình đăng nhập:', error);
        throw new Error('Lỗi khi đăng nhập người dùng');
    }
};

module.exports = { register, login };
