const ModelUser = require('./ModelUser');
const ModelShopOwner = require('../shopowner/ModelShopOwner');
const ModelShipper = require('../shipper/ModelShipper')
const ModelShopCategory = require('../categories/ShopCategory/ModelShopCategory');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendMail } = require('../../helpers/Mailer');

// Hàm đăng ký người dùng hoặc shop owner
const register = async (name, email, password, phone, image, rating, role, shopCategory_ids, address, latitude, longitude,) => {
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


            let shopOwner = new ModelShopOwner({
                name,
                email,
                password,
                phone,
                image,
                rating,
                role,
                shopCategory: shopCategories, // Thêm thông tin danh mục cửa hàng cho shop owner
                address,
                latitude,
                longitude // Sử dụng coordinates thay vì latitude và longitude riêng biệt
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

            // Nếu không tìm thấy shop owner, kiểm tra xem có phải shipper không
            if (!shopOwner) {
                let shipper = await ModelShipper.findOne({
                    $or: [{ email: identifier }, { phone: identifier }]
                });

                // Nếu không tìm thấy shipper, báo lỗi
                if (!shipper) {
                    throw new Error('Không tồn tại tài khoản với thông tin này');
                }

                // Kiểm tra mật khẩu shipper
                if (shipper.password.toString() !== password.toString()) {
                    throw new Error('Mật khẩu không đúng');
                }
                // Tạo token JWT cho shipper
                const token = jwt.sign(
                    { _id: shipper._id, name: shipper.name, email: shipper.email, role: 'shipper' },
                    'secret', // Khóa bí mật để mã hóa token (cần thay thế bằng giá trị thực tế)
                    { expiresIn: '1h' } // Token hết hạn sau 1 giờ
                );

                // Trả về thông tin shipper và token
                return {
                    _id: shipper._id,
                    name: shipper.name,
                    email: shipper.email,
                    role: 'shipper',
                    address: shipper.address,
                    token
                };
            }

            // Kiểm tra mật khẩu shop owner
            if (shopOwner.password.toString() !== password.toString()) {
                throw new Error('Mật khẩu không đúng');
            }

            // Tạo token JWT cho shop owner
            const token = jwt.sign(
                { _id: shopOwner._id, name: shopOwner.name, email: shopOwner.email, rating: shopOwner.rating, role: 'shopOwner', shopCategory: shopOwner.shopCategory },
                'secret',
                { expiresIn: '1h' }
            );

            // Trả về thông tin shop owner và token
            return {
                _id: shopOwner._id,
                name: shopOwner.name,
                email: shopOwner.email,
                rating: shopOwner.rating,
                role: 'shopOwner',
                shopCategory: shopOwner.shopCategory,
                address: shopOwner.address,
                coordinates: shopOwner.coordinates,
                token
            };
        }

        // Kiểm tra mật khẩu người dùng
        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            throw new Error('Tài khoản hoặc mật khẩu không đúng');
        }

        // Tạo token JWT cho người dùng thông thường
        const token = jwt.sign(
            { _id: user._id, name: user.name, email: user.email, role: user.role },
            'secret',
            { expiresIn: '1h' }
        );

        // Trả về thông tin người dùng và token
        return { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, token, image: user.image, password: user.password };
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
            phone: userInfo.phone,
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

const verifyEmail = async (email) => {
    try {
        let userInDB = await ModelUser.findOne({ email });
        if (!userInDB) {
            throw new Error('Email không tồn tại');
        }
        const verifyCode = Math.floor(1000 + Math.random() * 9000).toString();
        const data = {
            email: email,
            subject: 'Mã khôi phục mật khẩu',
            content: `Mã xác thực của bạn là: ${verifyCode}`
        }
        await sendMail(data);
        return verifyCode;
    }
    catch (error) {
        console.error('Error during verify email:', error);
        throw new Error('Lỗi khi xác thực email');
    }
}

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

const checkUser = async (email) => {
    try {
        const userInDB = await ModelUser.findOne({ email });
        if (!userInDB) {
            return false
        }
        return true
    } catch (error) {

    }
}
// Cập nhật thông tin nhà hàng
const updateUser = async (id, name, phone, email, password, image) => {
    try {

        const userInDB = await ModelUser.findById(id);
        if (!userInDB) {
            throw new Error('Không Tìm Thấy Tài Khoản, Hãy thử lại');
        }
        userInDB.name = name || userInDB.name;
        userInDB.phone = phone || userInDB.phone;
        userInDB.email = email || userInDB.email;
        userInDB.password = password || userInDB.password;
        userInDB.image = image || userInDB.image;


        let result = await userInDB.save();
        return result;
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin cửa hàng:', error);
        throw new Error('Lỗi khi cập nhật thông tin cửa hàng');
    }
};

// Lấy thông tin tất cả các nhà hàng
const getAllUsers = async () => {
    try {
        return await ModelUser.find();
    } catch (error) {
        console.error('Lỗi khi lấy thông tin tất cả các cửa hàng:', error);
        throw new Error('Lỗi khi lấy thông tin tất cả các cửa hàng');
    }
};
module.exports = { register, login,
     loginWithSocial, verifyEmail, resetPassword,
      checkUser, updateUser, getAllUsers };
