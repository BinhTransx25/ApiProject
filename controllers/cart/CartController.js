const ModelProduct = require("../products/ModelProduct");
const ModelUser = require("../users/ModelUser");
const ModelShopOwner = require("../shopowner/ModelShopOwner");
const CartModel = require("./CartModel");
const ObjectId = require('mongoose').Types.ObjectId;

const addToCart = async (user_id, shopOwner_id, products_id) => {
    try {
        console.log("--- Start addToCart ---");

        const userObjId = new ObjectId(user_id);
        const shopOwnerObjId = new ObjectId(shopOwner_id);

        const userInDB = await ModelUser.findById(userObjId);
        if (!userInDB) {
            throw new Error('User not found');
        }

        const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);
        if (!shopOwnerInDB) {
            throw new Error('ShopOwner not found');
        }

        const productInDB = await ModelProduct.findById(products_id);
        if (!productInDB) {
            throw new Error('Product not found');
        }

        let cart = await CartModel.findOne({
            "user._id": userObjId,
            "shopOwner._id": shopOwnerObjId
        });

        if (!cart) {
            console.log("Cart not found, creating new cart...");
            cart = new CartModel({
                user: { 
                    _id: userInDB._id, 
                    name: userInDB.name },
                shopOwner: { 
                    _id: shopOwnerInDB._id, 
                    name: shopOwnerInDB.name,
                    images: shopOwnerInDB.images,
                    address: shopOwnerInDB.address
                 },
                products: [{
                    _id: productInDB._id,
                    name: productInDB.name,
                    price: productInDB.price,
                    images: productInDB.images,
                    quantity: 1,
                }],
                totalItem: 1,
                totalPrice: productInDB.price,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            await cart.save();
            // userInDB.carts.push(cart); // Lưu giỏ hàng vào user
            // await userInDB.save({ validateBeforeSave: false });
            // console.log("New cart created:", cart);
            return cart;
        } else {
            console.log("Cart found, updating...");

            const productIndex = cart.products.findIndex(p => p._id.equals(productInDB._id));

            if (productIndex > -1) {
                // Nếu sản phẩm đã tồn tại trong giỏ hàng, tăng số lượng
                let existingProduct = cart.products[productIndex];
                existingProduct.quantity += 1;

                // Cập nhật lại sản phẩm đã được chỉnh sửa
                cart.products[productIndex] = existingProduct;
            } else {
                // Nếu sản phẩm chưa có trong giỏ, thêm sản phẩm mới với quantity = 1
                cart.products.push({
                    _id: productInDB._id,
                    name: productInDB.name,
                    price: productInDB.price,
                    images: productInDB.images,
                    quantity: 1,
                });
            }

            // Cập nhật lại tổng số sản phẩm và tổng giá
            cart.totalItem = cart.products.reduce((acc, product) => acc + product.quantity, 0);
            cart.totalPrice = cart.products.reduce((acc, product) => acc + product.price * product.quantity, 0);
            cart.updatedAt = Date.now();

            await cart.save();
            console.log("Cart updated:", cart);
            return cart;
        }
    } catch (error) {
        console.log('Error in addToCart:', error);
        return { status: false, message: error.message };
    }
};

const updateQuantityProduct = async (user_id, shopOwner_id, product_id, quantity) => {
    try {
        console.log("--- Start updateQuantityProduct ---");

        const userObjId = new ObjectId(user_id);
        const shopOwnerObjId = new ObjectId(shopOwner_id);
        const productObjId = new ObjectId(product_id);

        // Tìm giỏ hàng của user với shopOwner tương ứng
        const cart = await CartModel.findOne({
            'user._id': userObjId,
            'shopOwner._id': shopOwnerObjId
        });

        if (!cart) {
            throw new Error('Cart not found');
        }

        // Kiểm tra sản phẩm trong giỏ hàng
        const productIndex = cart.products.findIndex(p => p._id.equals(productObjId));
        if (productIndex === -1) {
            throw new Error('Product not found in cart');
        }

        // Nếu quantity = 0, xóa sản phẩm khỏi giỏ hàng
        if (quantity === 0) {
            console.log("Removing product from cart as quantity is 0...");
            cart.products.splice(productIndex, 1); // Xóa sản phẩm khỏi mảng

            // Cập nhật lại tổng số lượng và tổng giá sau khi xóa sản phẩm
            cart.totalItem = cart.products.reduce((acc, product) => acc + product.quantity, 0);
            cart.totalPrice = cart.products.reduce((acc, product) => acc + product.price * product.quantity, 0);

            // Nếu giỏ hàng rỗng sau khi xóa sản phẩm, xóa giỏ hàng
            if (cart.products.length === 0) {
                await CartModel.deleteOne({ _id: cart._id });
                console.log("Cart is empty, deleting cart...");
                return { status: true, message: "Cart deleted as it is empty" };
            }

            await cart.save();
            console.log("Cart updated successfully:", cart);
            return cart;
        } else {
            // Cập nhật số lượng sản phẩm nếu quantity > 0
            console.log(`Updating product quantity to ${quantity}...`);

            // Nếu sản phẩm đã tồn tại trong giỏ hàng, tăng số lượng
            let existingProduct = cart.products[productIndex];
            existingProduct.quantity = quantity;

            // Cập nhật lại sản phẩm đã được chỉnh sửa
            cart.products[productIndex] = existingProduct;

            // cart.products[productIndex].quantity = quantity;

            // Tính lại tổng số lượng và tổng giá sau khi cập nhật sản phẩm
            cart.totalItem = cart.products.reduce((acc, product) => acc + product.quantity, 0);
            cart.totalPrice = cart.products.reduce((acc, product) => acc + product.price * product.quantity, 0);

            cart.updatedAt = Date.now();
            await cart.save();

            console.log("Cart updated successfully:", cart);
            return cart;
        }
    } catch (error) {
        console.log('Error in updateQuantityProduct:', error);
        return { status: false, message: error.message };
    }
};


const deleteFromCart = async (user_id, shopOwner_id, product_id) => {
    try {
        console.log("--- Start deleteFromCart ---");

        const userObjId = new ObjectId(user_id);
        const shopOwnerObjId = new ObjectId(shopOwner_id);
        const productObjId = new ObjectId(product_id);

        // Kiểm tra người dùng có tồn tại hay không
        const userInDB = await ModelUser.findById(userObjId);
        if (!userInDB) {
            throw new Error('User not found');
        }

        // Kiểm tra chủ shop có tồn tại hay không
        const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);
        if (!shopOwnerInDB) {
            throw new Error('ShopOwner not found');
        }

        // Kiểm tra sản phẩm có tồn tại hay không
        const productInDB = await ModelProduct.findById(productObjId);
        if (!productInDB) {
            throw new Error('Product not found');
        }

        // Tìm giỏ hàng của người dùng cho shopOwner tương ứng
        let cart = await CartModel.findOne({
            "user._id": userObjId,
            "shopOwner._id": shopOwnerObjId
        });

        if (!cart) {
            throw new Error('Cart not found');
        }

        // Tìm sản phẩm trong giỏ hàng
        const productIndex = cart.products.findIndex(p => p._id.equals(productObjId));

        if (productIndex === -1) {
            throw new Error('Product not found in cart');
        }

        // Kiểm tra số lượng sản phẩm hiện tại
        let existingProduct = cart.products[productIndex];
        console.log(`Product found in cart with quantity: ${existingProduct.quantity}`);

        if (existingProduct.quantity > 1) {
            // Giảm số lượng sản phẩm
            existingProduct.quantity -= 1;
            cart.products[productIndex] = existingProduct; // Cập nhật sản phẩm đã được chỉnh sửa
            console.log(`Decreased quantity of product to: ${existingProduct.quantity}`);
        } else {
            // Nếu số lượng bằng 1 thì xóa sản phẩm khỏi giỏ hàng
            cart.products.splice(productIndex, 1);
            console.log(`Removed product from cart`);
        }

        // Cập nhật lại tổng số sản phẩm và tổng giá sau khi thay đổi
        cart.totalItem = cart.products.reduce((acc, product) => acc + product.quantity, 0);
        cart.totalPrice = cart.products.reduce((acc, product) => acc + product.price * product.quantity, 0);
        cart.updatedAt = Date.now();

        console.log(`Updated totalItem: ${cart.totalItem}, totalPrice: ${cart.totalPrice}`);

        // Nếu giỏ hàng trống sau khi xóa, xóa luôn giỏ hàng
        if (cart.products.length === 0) {
            await CartModel.deleteOne({ _id: cart._id });
            console.log("Cart is empty, deleted cart");
            return { message: 'Cart is empty, deleted' };
        } else {
            // Lưu lại giỏ hàng sau khi cập nhật
            await cart.save();
            console.log("Cart updated:", cart);
            return cart;
        }
    } catch (error) {
        console.log('Error in deleteFromCart:', error);
        return { status: false, message: error.message };
    }
};

// Lấy tất cả giỏ hàng của người dùng
const getCarts = async (user_id) => {
    try {
        console.log("--- Start getCarts ---");

        const userObjId = new ObjectId(user_id);

        // Kiểm tra người dùng có tồn tại hay không
        const userInDB = await ModelUser.findById(userObjId);
        if (!userInDB) {
            throw new Error('User not found');
        }

        // Lấy tất cả các giỏ hàng của người dùng
        let carts = await CartModel.find({ "user._id": userObjId });

        if (!carts || carts.length === 0) {
            throw new Error('No carts found');
        }

        // Trả về danh sách các giỏ hàng với thông tin cần thiết
        const cartList = carts.map(cart => ({
            shopName: cart.shopOwner.name,
            shopImage: cart.shopOwner.images,
            shopAddress: cart.shopOwner.address,
            totalItem: cart.totalItem,
            totalPrice: cart.totalPrice,
        }));

        console.log("Carts retrieved:", cartList);
        return cartList;
    } catch (error) {
        console.log('Error in getCarts:', error);
        return { status: false, message: error.message };
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
// Xóa sản phẩm khỏi giỏ hàng chưa test 
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

// Xóa giỏ hàng chưa test
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
module.exports = {
    addToCart,
    removeProductFromCart,
    deleteCart,
    getCarts,
    getCartByUserAndShop,
    updateQuantityProduct,
    deleteFromCart
};