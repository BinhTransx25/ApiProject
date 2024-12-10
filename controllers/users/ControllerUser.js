const ModelUser = require("./ModelUser");
const ModelShopOwner = require("../shopowner/ModelShopOwner");
const ModelShipper = require("../shipper/ModelShipper");
const ModelShopCategory = require("../categories/ShopCategory/ModelShopCategory");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../../helpers/Mailer");

// Hàm đăng ký người dùng hoặc shop owner
const register = async (
  name,
  email,
  password,
  phone,
  image,
  role,
  images,
  shopCategory_ids,
  address,
  latitude,
  longitude,
  verified,
  imageVerified
) => {
  try {
    // Kiểm tra email đã tồn tại trong hệ thống hay chưa
    let user = await ModelUser.findOne({ email });
    // console.log('role', role);
    console.log(
      name,
      email,
      password,
      phone,
      image,
      role,
      shopCategory_ids,
      address,
      latitude,
      longitude
    );

    if (user) {
      throw new Error("Email đã được sử dụng");
    }

    // Nếu vai trò là shopOwner, tạo một shop owner mới
    if (role === "shopOwner") {
      let shopCategories = [];
      for (const shopCategory_id of shopCategory_ids) {
        const categoryInDB = await ModelShopCategory.findById(shopCategory_id);
        if (!categoryInDB) {
          throw new Error("Category not found");
        }
        shopCategories.push({
          shopCategory_id: categoryInDB._id,
          shopCategory_name: categoryInDB.name,
        });
      }
      // Nếu không phải shop owner, tạo một người dùng thông thường
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      let shopOwner = new ModelShopOwner({
        name,
        email,
        password,
        phone,
        role,
        images,
        shopCategory: shopCategories, // Thêm thông tin danh mục cửa hàng cho shop owner
        address,
        latitude,
        longitude, // Sử dụng coordinates thay vì latitude và longitude riêng biệt
        verified,
        imageVerified
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
    console.error("Lỗi trong quá trình đăng ký:", error);
    throw new Error("Lỗi khi đăng ký người dùng");
  }
};

// Hàm đăng nhập người dùng hoặc shop owner
const login = async (identifier, password) => {
  try {
    // Tìm người dùng bằng email hoặc số điện thoại
    let user = await ModelUser.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    // Kiểm tra tài khoản nếu không tìm thấy trong bảng user
    if (!user) {
      let shopOwner = await ModelShopOwner.findOne({
        $or: [{ email: identifier }, { phone: identifier }],
      });

      // Nếu không tìm thấy shop owner, kiểm tra shipper
      if (!shopOwner) {
        let shipper = await ModelShipper.findOne({
          $or: [{ email: identifier }, { phone: identifier }],
        });

        if (!shipper) {
          throw new Error("Không tồn tại tài khoản với thông tin này");
        }

        // Kiểm tra trạng thái tài khoản shipper
        if (shipper.status === "Tài khoản bị khóa") {
          throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        // Kiểm tra mật khẩu shipper
        const checkPassword = await bcrypt.compare(password, shipper.password);
        if (!checkPassword) {
          throw new Error("Tài khoản hoặc mật khẩu không đúng");
        }

        // Tạo token JWT cho shipper
        const token = jwt.sign(
          {
            _id: shipper._id,
            name: shipper.name,
            email: shipper.email,
            role: "shipper",
          },
          "secret",
          { expiresIn: "1h" }
        );

        return {
          _id: shipper._id,
          name: shipper.name,
          email: shipper.email,
          role: "shipper",
          address: shipper.address,
          verified: shipper.verified,
          token,
        };
      }

      // Kiểm tra trạng thái tài khoản shop owner
      if (shopOwner.status === "Tài khoản bị khóa") {
        throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
      }

      // Kiểm tra mật khẩu shop owner
      const checkPassword = await bcrypt.compare(password, shopOwner.password);
      if (!checkPassword) {
        throw new Error("Tài khoản hoặc mật khẩu không đúng");
      }

      // Tạo token JWT cho shop owner
      const token = jwt.sign(
        {
          _id: shopOwner._id,
          name: shopOwner.name,
          email: shopOwner.email,
          rating: shopOwner.rating,
          role: "shopOwner",
          shopCategory: shopOwner.shopCategory,
        },
        "secret",
        { expiresIn: "1h" }
      );

      return {
        _id: shopOwner._id,
        name: shopOwner.name,
        email: shopOwner.email,
        rating: shopOwner.rating,
        role: "shopOwner",
        shopCategory: shopOwner.shopCategory,
        address: shopOwner.address,
        coordinates: shopOwner.coordinates,
        verified: shopOwner.verified,
        token,
      };
    }

    // Kiểm tra trạng thái tài khoản user
    if (user.status === "Tài khoản bị khóa") {
      throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
    }

    // Kiểm tra mật khẩu người dùng
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      throw new Error("Tài khoản hoặc mật khẩu không đúng");
    }

    // Tạo token JWT cho người dùng
    const token = jwt.sign(
      { _id: user._id, name: user.name, email: user.email, role: user.role },
      "secret",
      { expiresIn: "1h" }
    );

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token,
      image: user.image,
      password: user.password,
    };
  } catch (error) {
    console.error("Lỗi trong quá trình đăng nhập:", error);
    throw new Error(error.message || "Lỗi khi đăng nhập người dùng");
  }
};


const loginWithSocial = async (userInfo) => {
  try {
    let userInDB = await ModelUser.findOne({ email: userInfo.email });
    let user;

    const body = {
      email: userInfo.email,
      name: userInfo.name,
      image: userInfo.photo,
      phone: userInfo.phone,
      password: "123456",
    };

    if (!userInDB) {
      // Nếu không tìm thấy trong ModelUser, kiểm tra ModelShipper
      let shipperInDB = await ModelShipper.findOne({ email: userInfo.email });
      if (!shipperInDB) {
        // Nếu không tìm thấy trong ModelShipper, kiểm tra ModelShopOwner
        let shopOwnerInDB = await ModelShopOwner.findOne({
          email: userInfo.email,
        });
        if (!shopOwnerInDB) {
          // Nếu không tìm thấy trong cả ba mô hình, tạo mới
          user = new ModelUser(body);
          await user.save();
        } else {
          // Nếu tìm thấy trong ModelShopOwner, kiểm tra trạng thái
          if (shopOwnerInDB.status === "Tài khoản bị khóa") {
            throw new Error("Tài khoản của bạn đã bị khóa");
          }
          // Nếu trạng thái hợp lệ, trả về thông tin
          return shopOwnerInDB;
        }
      } else {
        // Nếu tìm thấy trong ModelShipper, kiểm tra trạng thái
        if (shipperInDB.status === "Tài khoản bị khóa") {
          throw new Error("Tài khoản của bạn đã bị khóa");
        }
        // Nếu trạng thái hợp lệ, trả về thông tin
        return shipperInDB;
      }
    } else {
      // Nếu tìm thấy trong ModelUser, kiểm tra trạng thái
      if (userInDB.status === "Tài khoản bị khóa") {
        throw new Error("Tài khoản của bạn đã bị khóa");
      }
      // Nếu trạng thái hợp lệ, cập nhật thông tin
      user = await ModelUser.findByIdAndUpdate(userInDB._id, {
        ...userInfo,
        updatedAt: Date.now(),
      });
    }

    return user; // Trả về user từ ModelUser
  } catch (error) {
    console.log("Error during login with social:", error);
    throw new Error("Lỗi khi đăng nhập bằng tài khoản mạng xã hội");
  }
};


const verifyEmail = async (email) => {
  try {
    let userInDB = await ModelUser.findOne({ email });
    if (!userInDB) {
      userInDB = await ModelShipper.findOne({ email });
      if (!userInDB) {
        userInDB = await ModelShopOwner.findOne({ email });
        if (!userInDB) {
          throw new Error("Email không tồn tại");
        }
      }
    }

    // Kiểm tra trạng thái tài khoản
    if (userInDB.status === "Tài khoản bị khóa") {
      throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
    }

    // Tạo mã xác thực
    const verifyCode = Math.floor(1000 + Math.random() * 9000).toString();
    const data = {
      email: email,
      subject: "Mã khôi phục mật khẩu",
      content: `Mã xác thực của bạn là: ${verifyCode}`,
    };

    // Gửi email xác thực
    await sendMail(data);
    return verifyCode;
  } catch (error) {
    console.error("Error during verify email:", error);
    throw new Error(error.message || "Lỗi khi xác thực email");
  }
};


const resetPassword = async (email, password) => {
  try {
    const userInDB = await ModelUser.findOne({ email });
    if (!userInDB) {
      const shipperInDB = await ModelShipper.findOne({ email });
      if (!shipperInDB) {
        const shopOwnerInDB = await ModelShopOwner.findOne({ email });
        if (!shopOwnerInDB) {
          throw new Error("Email không tồn tại");
        }
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        await ModelShopOwner.findByIdAndUpdate(shopOwnerInDB._id, { password });
        return true;
      } else {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        await ModelShipper.findByIdAndUpdate(shipperInDB._id, { password });
        return true;
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      await ModelUser.findByIdAndUpdate(userInDB._id, { password });
      return true;
    }
  } catch (error) {
    console.log("Error during reset password:", error);
    throw new Error("Lỗi khi đặt lại mật khẩu");
  }
};

const changePassword = async (email, oldPassword, newPassword) => {
  try {
    // Tìm admin theo email
    const userInDB = await ModelUser.findOne({ email });
    if (!userInDB) {
      throw new Error('Email không tồn tại');
    }

    // Kiểm tra mật khẩu cũ
    // Nếu mật khẩu đã được băm
    const checkPassword = await bcrypt.compare(oldPassword, userInDB.password);
    if (!checkPassword) {
      return { message: 'Mật khẩu cũ không đúng' };
    }


    // Băm mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    userInDB.password = await bcrypt.hash(newPassword, salt);

    // Lưu mật khẩu mới vào cơ sở dữ liệu
    await userInDB.save();

    return { message: 'Đổi mật khẩu thành công' };
  } catch (error) {
    console.error('Error changing password:', error);
    throw new Error('Error changing password');
  }
};

const checkUser = async (email) => {
  try {
    const userInDB = await ModelUser.findOne({ email });
    if (userInDB) {
      return true;
    }

    const shipperInDB = await ModelShipper.findOne({ email });
    if (shipperInDB) {
      return true;
    }

    const shopOwnerInDB = await ModelShopOwner.findOne({ email });
    if (shopOwnerInDB) {
      return true;
    }

    return false;
  } catch (error) {
    console.error(error);
    return false; // Hoặc xử lý lỗi theo cách bạn muốn
  }
};

// Cập nhật thông tin nhà hàng
const updateUser = async (id, name, phone, email, password, image, birthday) => {

  try {
    const userInDB = await ModelUser.findById(id);
    if (!userInDB) {
      throw new Error("Không Tìm Thấy Tài Khoản, Hãy thử lại");
    }
    userInDB.name = name || userInDB.name;
    userInDB.phone = phone || userInDB.phone;
    userInDB.email = email || userInDB.email;
    userInDB.password = password || userInDB.password;
    userInDB.image = image || userInDB.image;
    userInDB.birthday = birthday || userInDB.birthday;
    userInDB.updatedAt = Date.now();

    let result = await userInDB.save();
    return result;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin khách hàng:", error);
    throw new Error("Lỗi khi cập nhật thông tin khách hàng");
  }
};

// Lấy thông tin tất cả các user
const getAllUsers = async () => {
  try {
    return await ModelUser.find();
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tất cả các cửa hàng:", error);
    throw new Error("Lỗi khi lấy thông tin tất cả các cửa hàng");
  }
};

// Lấy thông tin user theo ID
const getUserById = async (id) => {
  try {
    const user = await ModelUser.findById(
      id,
      "name phone email address orders carts image status isDeleted verified"
    );

    if (!user) {
      throw new Error("User không tìm thấy");
    }
    return user;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng theo ID:", error);
    throw new Error("Lỗi khi lấy thông tin người dùng theo ID");
  }
};

// Xóa User
const deleteUser = async (id) => {
  try {
    return await ModelUser.findByIdAndDelete(id);
  } catch (error) {
    console.error("Lỗi khi xóa user:", error);
    throw new Error("Lỗi khi xóa user");
  }
};

// Cập nhật sản phẩm thành xóa mềm và chuyển trạng thái thành 'Tài khoản bị khóa'
const removeSoftDeleted = async (id) => {
  try {
    const userInDB = await ModelUser.findById(id);
    if (!userInDB) {
      throw new Error('User not found');
    }

    // Cập nhật trạng thái isDeleted và status
    let result = await ModelUser.findByIdAndUpdate(
      id,
      { isDeleted: true, status: 'Tài khoản bị khóa' },
      { new: true } // Trả về document đã cập nhật
    );
    return result;
  } catch (error) {
    console.log('Remove User error:', error);
    throw new Error('Remove User error');
  }
};

// Chuyển trạng thái
const restoreAndSetAvailable = async (id) => {
  try {
    const userInDB = await ModelUser.findById(id);
    if (!userInDB) {
      throw new Error('User not found');
    }

    // Cập nhật trạng thái
    const result = await ModelUser.findByIdAndUpdate(
      id,
      { isDeleted: false, status: 'Hoạt động' },
      { new: true } // Trả về document đã cập nhật
    );
    return result;
  } catch (error) {
    console.log('Restore User error:', error);
    throw new Error('Restore User error');
  }
};




module.exports = {
  register,
  login,
  loginWithSocial,
  verifyEmail,
  resetPassword,
  checkUser,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
  changePassword,
  removeSoftDeleted,
  restoreAndSetAvailable

};
