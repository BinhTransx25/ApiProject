const ModelUser = require('./ModelUser');
const ModelShopOwner = require('../shopowner/ModelShopOwner');
const ModelShopCategory = require('../categories/ShopCategory/ModelShopCategory');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Hàm đăng ký người dùng hoặc shop owner
const register = async (name, email, password, phone, role, shopCategory_ids, address, latitude, longitude) => {
    try {
        // Kiểm tra email đã tồn tại trong hệ thống hay chưa
        let user = await ModelUser.findOne({ email });
        if (user) {
            throw new Error('Email đã được sử dụng');
        }

        // Nếu vai trò là shopOwner, tạo một shop owner mới
        if (role === 'shopOwner') {
            let shopCategories = [];
            for (const shopCategory_id of shopCategory_ids) {
                const categoryInDB = await ModelShopCategory.findById(shopCategory_id);
                if (!categoryInDB) {
                    throw new Error('Category not found');
                }
                shopCategories.push({
                    shopCategory_id: categoryInDB._id,
                    shopCategory_name: categoryInDB.name
                });
            }

            // Tạo biến coordinates từ latitude và longitude
            const coordinates = {
                latitude: latitude,
                longitude: longitude
            };

            let shopOwner = new ModelShopOwner({
                name,
                email,
                password,
                phone,
                role,
                shopCategory: shopCategories, // Thêm thông tin danh mục cửa hàng cho shop owner
                address,
                coordinates // Sử dụng coordinates thay vì latitude và longitude riêng biệt
            });
            await shopOwner.save(); // Lưu shop owner vào cơ sở dữ liệu
        } else {
            // Nếu không phải shop owner, tạo một người dùng thông thường
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);
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
                address: shopOwner.address,
                coordinates: shopOwner.coordinates,  // Trả về coordinates thay vì latitude và longitude riêng biệt
                token
            };
        }

        // Kiểm tra mật khẩu người dùng
        const checkPassword = await bcrypt.compare(password, user.password);
        // if (user.password.toString() !== password.toString()) {
        //     throw new Error('Mật khẩu không đúng');
        // }
        if (!checkPassword) {
            throw new Error('Tài khoản hoặc mật khẩu không đúng');
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

const loginWithSocial = async (userInfo) => {
    try {
        let userInDB = await ModelUser.findOne({ email: userInfo.email });
        let user
        const body = {
            email: userInfo.email,
            name: userInfo.name,
            photo: userInfo.photo,
            phone:userInfo.phone,
            password: '123456',
        }
        if (!userInDB) {
            user = new ModelUser(body);
            await user.save();
        }
        else {
            user = await ModelUser.findByIdAndUpdate(userInDB._id, { ...userInfo, updatedAt: Date.now() });
        }
        return user;
    } catch (error) {
        console.log('Error during login with social:', error);
        throw new Error('Lỗi khi đăng nhập bằng tài khoản mạng xã hội');
    }
}

module.exports = { register, login, loginWithSocial };
