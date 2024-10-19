const ModelProduct = require("../products/ModelProduct");
const ModelUser = require("../users/ModelUser");
const ModelShopOwner = require("../shopowner/ModelShopOwner");
const CartModel = require("./CartModel");
const ObjectId = require('mongoose').Types.ObjectId;

const addToCart = async (user, shopOwner, products) => {
    try {
        // Tìm user trong cơ sở dữ liệu
        const userInDB = await ModelUser.findById(user);
        if (!userInDB) {
            throw new Error('User not found');
        }

        // Tìm shop owner
        const shopOwnerInDB = await ModelShopOwner.findById(shopOwner);
        if (!shopOwnerInDB) {
            throw new Error('ShopOwner not found');
        }

        // Duyệt qua từng productId trong mảng products và lấy thông tin sản phẩm
        let productsToAdd = [];
        for (const product of products) {
            const productInDB = await ModelProduct.findById(product);
            if (!productInDB) {
                throw new Error('Product not found');
            }
            productsToAdd.push({
                _id: productInDB._id,
                name: productInDB.name,
                price: productInDB.price,
                image: productInDB.image,
                quantity: product.quantity || 1
            });
        }

        // Kiểm tra giỏ hàng trong user.carts
        let cart = userInDB.carts.find(c => 
            c.user._id.toString() === user && c.shopOwner._id.toString() === shopOwner
        );

        if (!cart) {
            // Tạo mới giỏ hàng nếu chưa tồn tại
            const newCart = {
                user: { _id: userInDB._id, email: userInDB.email },
                shopOwner: { _id: shopOwnerInDB._id, name: shopOwnerInDB.name },
                products: productsToAdd, // Thêm toàn bộ sản phẩm vào giỏ hàng
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            // Thêm giỏ hàng mới vào user.carts
            userInDB.carts.push(newCart);

            // Lưu lại thông tin user
            await userInDB.save();

            return newCart; // Trả về giỏ hàng mới tạo
        } else {
            // Cập nhật giỏ hàng hiện có
            for (const productToAdd of productsToAdd) {
                const productIndex = cart.products.findIndex(p => p._id.toString() === productToAdd._id.toString());
                
                if (productIndex > -1) {
                    // Nếu sản phẩm đã tồn tại trong giỏ hàng, cập nhật số lượng
                    cart.products[productIndex].quantity += productToAdd.quantity;
                } else {
                    // Nếu chưa có sản phẩm trong giỏ hàng, thêm sản phẩm vào
                    cart.products.push(productToAdd);
                }
            }

            cart.updatedAt = Date.now(); // Cập nhật thời gian thay đổi

            // Lưu lại thông tin user
            await userInDB.save();

            return cart; // Trả về giỏ hàng đã cập nhật
        }

    } catch (error) {
        console.log('Error in addToCart:', error);
        throw new Error(error.message);
    }
};



// Xóa sản phẩm khỏi giỏ hàng
const removeProductFromCart = async (user, shopOwner, productId) => {
    try {
        const cart = await CartModel.findOne({ 
            "user._id": new ObjectId(user), 
            "shopOwner._id": new ObjectId(shopOwner) 
        });

        if (!cart) {
            throw new Error('Cart not found');
        }

        // Xóa sản phẩm khỏi giỏ
        cart.products = cart.products.filter(product => product._id.toString() !== productId);
        
        // Nếu giỏ hàng rỗng thì xóa giỏ hàng
        if (cart.products.length === 0) {
            await CartModel.deleteOne({ _id: cart._id });
            return { message: 'Cart deleted because it was empty' };
        }

        cart.updatedAt = Date.now();
        await cart.save();
        return cart;
    } catch (error) {
        console.log('Error in removeProductFromCart:', error);
        throw new Error(error.message);
    }
};

// Xóa giỏ hàng
const deleteCart = async (user, shopOwner) => {
    try {
        await CartModel.deleteOne({ 
            "user._id": new ObjectId(user), 
            "shopOwner._id": new ObjectId(shopOwner) 
        });
        return { message: 'Cart deleted successfully' };
    } catch (error) {
        console.log('Error in deleteCart:', error);
        throw new Error(error.message);
    }
};

// Lấy tất cả giỏ hàng của người dùng
const getCartsByUser = async (user) => {
    try {
        const carts = await CartModel.find({ "user._id": new ObjectId(user) });
        if (!carts || carts.length === 0) {
            throw new Error('No carts found for this user');
        }
        return carts;
    } catch (error) {
        throw new Error(`Error in getCartsByUser: ${error.message}`);
    }
};

// Lấy chi tiết giỏ hàng của người dùng và shop
const getCartByUserAndShop = async (user, shopOwner) => {
    try {
        const cart = await CartModel.findOne({ 
            "user._id": new ObjectId(user), 
            "shopOwner._id": new ObjectId(shopOwner)
        });
        if (!cart) {
            throw new Error('Cart not found for this user and shop');
        }
        return cart;
    } catch (error) {
        throw new Error(`Error in getCartByUserAndShop: ${error.message}`);
    }
};

module.exports = { 
    addToCart, 
    removeProductFromCart, 
    deleteCart, 
    getCartsByUser, 
    getCartByUserAndShop 
};