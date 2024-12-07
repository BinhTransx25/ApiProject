const ModelProduct = require("../products/ModelProduct");
const ModelUser = require("../users/ModelUser");
const ModelShopOwner = require("../shopowner/ModelShopOwner");
const CartModel = require("./CartModel");
const ObjectId = require('mongoose').Types.ObjectId;

// Thêm 1 sản phẩm vào giỏ hàng 
const addToCart = async (user_id, shopOwner_id, products_id) => {
    let errors = null; // Biến lưu trữ lỗi

    try {
        console.log("--- Start addToCart ---");

        const userObjId = new ObjectId(user_id);
        const shopOwnerObjId = new ObjectId(shopOwner_id);

        // Kiểm tra user
        const userInDB = await ModelUser.findById(userObjId);
        if (!userInDB) {
            errors = 'User không tồn tại';
            return { carts: null, errors };
        }

        // Kiểm tra shop
        const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);
        if (!shopOwnerInDB) {
            errors = 'Shop không tồn tại';
            return { carts: null, errors };
        }

        // Tìm giỏ hàng hiện tại
        const existingCart = await CartModel.findOne({
            "user._id": userObjId,
            "shopOwner._id": shopOwnerObjId,
        });

        // Kiểm tra trạng thái shop
        if (shopOwnerInDB.status == 'Đóng cửa') {
            // if (existingCart) {
            //     await CartModel.deleteOne({ _id: existingCart._id }); // Xóa cart nếu tồn tại
            // }
            errors = 'Shop hiện đang đóng cửa';
            return { carts: null, errors };
        }
        if (shopOwnerInDB.status == 'Ngưng hoạt động') {
            // if (existingCart) {
            //     await CartModel.deleteOne({ _id: existingCart._id }); // Xóa cart nếu tồn tại
            // }
            errors = 'Shop hiện đang Ngưng hoạt động';
            return { status: false, errors };
        }
        if (shopOwnerInDB.status == 'Tài khoản bị khóa') {
            // if (existingCart) {
            //     await CartModel.deleteOne({ _id: existingCart._id }); // Xóa cart nếu tồn tại
            // }
            errors = 'Không tìm thấy cửa hàng, vui lòng thử lại sau';
            return { status: false, errors };
        }

        // Kiểm tra sản phẩm
        const productInDB = await ModelProduct.findById(products_id);
        if (!productInDB) {
            errors = 'Sản phẩm không tồn tại';
            return { carts: null, errors };
        }

        // Kiểm tra trạng thái sản phẩm
        if (productInDB.status !== 'Còn món') {
            // if (existingCart) {
            //     await CartModel.deleteOne({ _id: existingCart._id }); // Xóa cart nếu tồn tại
            // }
            errors = 'Sản phẩm hiện không còn món';
            return { carts: null, errors };
        }

        // Nếu không có cart hiện tại, tạo mới
        if (!existingCart) {
            console.log("Cart không tồn tại, tạo mới...");
            const newCart = new CartModel({
                user: {
                    _id: userInDB._id,
                    name: userInDB.name,
                },
                shopOwner: {
                    _id: shopOwnerInDB._id,
                    name: shopOwnerInDB.name,
                    images: shopOwnerInDB.images,
                    address: shopOwnerInDB.address,
                    latitude: shopOwnerInDB.latitude,
                    longitude: shopOwnerInDB.longitude,
                },
                products: [
                    {
                        _id: productInDB._id,
                        name: productInDB.name,
                        price: productInDB.price,
                        images: productInDB.images,
                        soldOut: productInDB.soldOut,
                        quantity: 1,
                    },
                ],
                totalItem: 1,
                totalPrice: productInDB.price,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                isDeleted: false, // Giỏ hàng mới luôn active
            });

            await newCart.save();
            return { status: true, message: 'Cart tạo thành công', carts: newCart };
        } else {
            console.log("Cart đã tồn tại, cập nhật...");

            const productIndex = cart.products.findIndex((p) =>
                p._id.equals(productInDB._id)
            );

            if (productIndex > -1) {
                // Nếu sản phẩm đã tồn tại trong giỏ hàng, tăng số lượng
                cart.products[productIndex].quantity += 1;
            } else {
                // Nếu sản phẩm chưa có trong giỏ, thêm sản phẩm mới với quantity = 1
                cart.products.push({
                    _id: productInDB._id,
                    name: productInDB.name,
                    price: productInDB.price,
                    images: productInDB.images,
                    soldOut: productInDB.soldOut,
                    quantity: 1,
                });
            }

            // Cập nhật lại tổng số sản phẩm và tổng giá
            cart.totalItem = cart.products.reduce(
                (acc, product) => acc + product.quantity,
                0
            );
            cart.totalPrice = cart.products.reduce(
                (acc, product) => acc + product.price * product.quantity,
                0
            );
            cart.updatedAt = Date.now();

            await existingCart.save();
            console.log("Cart đã cập nhật:", existingCart);
            return { status: true, message: 'Cart cập nhật thành công', carts: existingCart };
        }
    } catch (error) {
        console.log("Lỗi trong addToCart:", error);
        errors = 'Đã xảy ra lỗi không xác định';
        return { status: false, errors };
    }
};


// Cập nhật số lượng trực tiếp
const updateQuantityProduct = async (user_id, shopOwner_id, product_id, quantity) => {
    let errors = null; // Biến lưu trữ lỗi
    try {
        console.log("--- Start updateQuantityProduct ---");

        const userObjId = new ObjectId(user_id);
        const shopOwnerObjId = new ObjectId(shopOwner_id);
        const productObjId = new ObjectId(product_id);

        // Kiểm tra người dùng
        const userInDB = await ModelUser.findById(userObjId);
        if (!userInDB) {
            throw new Error('User not found');
        }

        // Lấy thông tin shop
        const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);
        if (!shopOwnerInDB) {
            throw new Error('ShopOwner not found');
        }

        // Kiểm tra trạng thái của shop
        if (shopOwnerInDB.status !== 'Mở cửa') {
            // Xóa giỏ hàng liên quan
            // await CartModel.deleteMany({ 'shopOwner._id': shopOwnerObjId });
            errors = 'Shop hiện đang đóng cửa';
            return { status: false, errors };
        }

        // Lấy thông tin sản phẩm
        const productInDB = await ModelProduct.findById(productObjId);
        if (!productInDB) {
            throw new Error('Product not found');
        }

        // Kiểm tra trạng thái của sản phẩm
        if (productInDB.status !== 'Còn món') {
            // Nếu sản phẩm không phải "Còn món", đánh dấu tất cả giỏ hàng liên quan là isDeleted: true
            await CartModel.updateMany(
                { 'products._id': productObjId, isDeleted: false },
                { $set: { isDeleted: true } }
            );
            throw new Error('Product is out of stock, all related carts are marked as deleted');
        }

        // Tìm giỏ hàng của user với shopOwner tương ứng
        const cart = await CartModel.findOne({
            'user._id': userObjId,
            'shopOwner._id': shopOwnerObjId,
            isDeleted: false
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

            // Nếu sản phẩm đã tồn tại trong giỏ hàng, cập nhật số lượng
            let existingProduct = cart.products[productIndex];
            existingProduct.quantity = quantity;

            // Cập nhật lại sản phẩm đã được chỉnh sửa
            cart.products[productIndex] = existingProduct;

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


// Trừ 1 sản phẩm trong giỏ hàng
const deleteFromCart = async (user_id, shopOwner_id, product_id) => {
    try {
        console.log("--- Start deleteFromCart ---");

        const userObjId = new ObjectId(user_id);
        const shopOwnerObjId = new ObjectId(shopOwner_id);
        const productObjId = new ObjectId(product_id);

        // Kiểm tra user
        const userInDB = await ModelUser.findById(userObjId);
        if (!userInDB) {
            throw new Error('User not found');
        }

        // Kiểm tra shopOwner
        const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);
        if (!shopOwnerInDB) {
            throw new Error('ShopOwner not found');
        }

        // Kiểm tra trạng thái của shop
        if (shopOwnerInDB.status !== "mở cửa") {
            await CartModel.updateMany(
                { "shopOwner._id": shopOwnerObjId, isDeleted: false },
                { $set: { isDeleted: true } }
            );
            throw new Error('Shop is closed, all carts have been marked as deleted');
        }

        // Kiểm tra sản phẩm
        const productInDB = await ModelProduct.findById(productObjId);
        if (!productInDB) {
            throw new Error('Product not found');
        }

        // Kiểm tra trạng thái của sản phẩm
        if (productInDB.status !== "Còn món") {
            await CartModel.updateMany(
                { "products._id": productObjId, isDeleted: false },
                { $set: { isDeleted: true } }
            );
            throw new Error('Product is no longer available, cart has been marked as deleted');
        }

        // Xóa tất cả giỏ hàng cũ `isDeleted: true` liên quan đến user và shopOwner
        await CartModel.deleteMany({
            "user._id": userObjId,
            "shopOwner._id": shopOwnerObjId,
            isDeleted: true,
        });

        // Tìm giỏ hàng hiện tại
        let cart = await CartModel.findOne({
            "user._id": userObjId,
            "shopOwner._id": shopOwnerObjId,
            isDeleted: false,
        });

        if (!cart) {
            throw new Error('Cart not found');
        }

        // Tìm sản phẩm trong giỏ hàng
        const productIndex = cart.products.findIndex((p) =>
            p._id.equals(productObjId)
        );

        if (productIndex === -1) {
            throw new Error('Product not found in cart');
        }

        // Kiểm tra số lượng sản phẩm trong giỏ
        let existingProduct = cart.products[productIndex];
        console.log(`Product found in cart with quantity: ${existingProduct.quantity}`);

        if (existingProduct.quantity > 1) {
            // Nếu số lượng > 1, giảm số lượng
            existingProduct.quantity -= 1;
            cart.products[productIndex] = existingProduct;
            console.log(`Decreased quantity of product to: ${existingProduct.quantity}`);
        } else {
            // Nếu số lượng = 1, xóa sản phẩm khỏi giỏ
            cart.products.splice(productIndex, 1);
            console.log(`Removed product from cart`);
        }

        // Cập nhật tổng số lượng và tổng giá
        cart.totalItem = cart.products.reduce(
            (acc, product) => acc + product.quantity,
            0
        );
        cart.totalPrice = cart.products.reduce(
            (acc, product) => acc + product.price * product.quantity,
            0
        );
        cart.updatedAt = Date.now();

        console.log(`Updated totalItem: ${cart.totalItem}, totalPrice: ${cart.totalPrice}`);

        // Xóa giỏ hàng nếu không còn sản phẩm
        if (cart.products.length === 0) {
            await CartModel.deleteOne({ _id: cart._id });
            console.log("Cart is empty, deleted cart");
            return { message: 'Cart is empty, deleted' };
        } else {
            // Lưu lại giỏ hàng
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
            return { carts: null, errors: { reason: "User not found" } };
        }

        // Lấy tất cả các giỏ hàng của người dùng
        const carts = await CartModel.find({ "user._id": userObjId });
        if (!carts || carts.length === 0) {
            return { carts: null, errors: { reason: "No carts found" } };
        }

        const results = [];

        // Lặp qua tất cả giỏ hàng để kiểm tra trạng thái của shop và sản phẩm
        for (let cart of carts) {
            const shopOwnerObjId = new ObjectId(cart.shopOwner._id);

            // Kiểm tra trạng thái của shopOwner
            const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);
            if (!shopOwnerInDB) {
                return {
                    carts: null,
                    errors: { reason: "ShopOwner not found" }
                };
            }

            if (shopOwnerInDB.status == "Mở cửa") {
                // Nếu shop đóng cửa, xóa giỏ hàng và trả về lỗi
                return {carts};
            }

            if (shopOwnerInDB.status == "Đóng cửa") {
                // Nếu shop không mở cửa, xóa giỏ hàng và trả về lỗi
                return {
                    carts,
                    errors: {
                        shopName: cart.shopOwner.name,
                        reason: `Vui lòng thêm lại sau, Shop hiện tại đang: ${shopOwnerInDB.status}`,
                    },
                };
            } 
             if (shopOwnerInDB.status == "Ngưng hoạt động" || shopOwnerInDB.status == "Tài khoản bị khóa") {
                // Nếu shop không mở cửa, xóa giỏ hàng và trả về lỗi
                return {
                    carts: null,
                    errors: {
                        shopName: cart.shopOwner.name,
                        reason: `Vui lòng thêm lại sau, Shop hiện tại đang: ${shopOwnerInDB.status}`,
                    },
                };
            } 
            // Kiểm tra trạng thái của sản phẩm trong giỏ hàng

            for (let product of cart.products) {
                const productObjId = new ObjectId(product._id);

                const productInDB = await ModelProduct.findById(productObjId);
                if (!productInDB) {
                    return {
                        carts: null,
                        errors: {
                            shopName: cart.shopOwner.name,
                            productName: product.name,
                            reason: "Product not found",
                        },
                    };
                }

                if (productInDB.status !== "Còn món") {
                    // Nếu sản phẩm không còn món, xóa giỏ hàng và trả về lỗi

                    return {
                        carts: null,
                        errors: {
                            shopName: cart.shopOwner.name,
                            productName: product.name,
                            reason: `Vui lòng thêm lại sau, Món hiện tại đang: ${productInDB.status}`,
                        },
                    };
                }
            }

            // Nếu giỏ hàng hợp lệ, thêm vào danh sách kết quả
            results.push({
                shopId: cart.shopOwner._id,
                shopName: cart.shopOwner.name,
                shopImage: cart.shopOwner.images,
                shopAddress: cart.shopOwner.address,
                totalItem: cart.totalItem,
                totalPrice: cart.totalPrice,
            });
        }

        console.log("Carts retrieved:", results);

        // Nếu không có lỗi, trả về giỏ hàng
        return { carts: results, errors: null };
    } catch (error) {
        console.log("Error in getCarts:", error);
        return { carts: null, errors: { reason: `Lỗi hệ thống: ${error.message}` } };
    }
};



// Lấy chi tiết giỏ hàng của người dùng và shop
const getCartByUserAndShop = async (user, shopOwner) => {
    let errors = null;

    try {
        // Tìm giỏ hàng của user và shopOwner
        const carts = await CartModel.findOne({
            "user._id": new ObjectId(user),
            "shopOwner._id": new ObjectId(shopOwner),
        });

        if (!carts) {
            errors = { reason: "Giỏ hàng không tồn tại." };
            return { carts: null, errors };
        }

        // Kiểm tra trạng thái của shop owner
        const shopOwnerObjId = new ObjectId(shopOwner);
        const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);

        if (!shopOwnerInDB) {
            errors = { reason: "Shop owner không tồn tại." };
            return { carts: null, errors };
        }
        if (shopOwnerInDB.status == "Mở cửa") {
            // Nếu shop đóng cửa, xóa giỏ hàng và trả về lỗi
            return { carts };
        }
        if (shopOwnerInDB.status == "Đóng cửa") {
            // Nếu shop đóng cửa, xóa giỏ hàng và trả về lỗi
            errors = {
                shopName: shopOwnerInDB.name,
                reason: `Vui lòng thêm lại sau, Shop hiện tại đang: ${shopOwnerInDB.status}`,
            };
            return { carts, errors };
        }

        if (shopOwnerInDB.status == "Ngưng hoạt động" || shopOwnerInDB.status == "Tài khoản bị khóa") {
            // Nếu shop đóng cửa, xóa giỏ hàng và trả về lỗi

            errors = {
                shopName: shopOwnerInDB.name,
                reason: `Vui lòng thêm lại sau, Shop hiện tại đang: ${shopOwnerInDB.status}`,
            };
            return { carts: null, errors };
        }

        // Kiểm tra trạng thái của các sản phẩm trong giỏ hàng
        for (let product of carts.products) {
            const productObjId = new ObjectId(product._id);
            const productInDB = await ModelProduct.findById(productObjId);

            if (!productInDB) {
                errors = { productName: product.name, reason: "Sản phẩm không tồn tại." };
                return { carts: null, errors };
            }

            if (productInDB.status !== "Còn món") {
                // Nếu sản phẩm không còn món, xóa giỏ hàng và trả về lỗi

                errors = {
                    productName: product.name,
                    reason: `Vui lòng thêm lại sau, Món hiện tại đang: ${productInDB.status}`,
                };
                return { carts: null, errors };
            }
        }

        // Nếu không có lỗi, trả về giỏ hàng
        return { carts, errors };
    } catch (error) {
        // Nếu lỗi xảy ra trong try-catch, gán lỗi vào errors
        errors = { reason: `Lỗi hệ thống: ${error.message}` };
        return { carts: null, errors };
    }
};



// Xóa giỏ hàng đó khi đã được thanh toán 
const deleteCartWhenPayment = async (user, shopOwner) => {
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

const deleteCartUser = async (user) => {
    try {
        await CartModel.deleteMany({
            "user._id": new ObjectId(user),
        });
        return { message: 'Cart deleted successfully' };
    } catch (error) {
        console.log('Error in deleteCart:', error);
        throw new Error(error.message);
    }
};

// Cập nhật sản phẩm thành xóa mềm và chuyển trạng thái thành 'Tài khoản bị khóa'
const removeSoftDeleted = async (id) => {
    try {
        const cartInDB = await CartModel.findById(id);
        if (!cartInDB) {
            throw new Error('cart not found');
        }

        // Cập nhật trạng thái isDeleted và status
        let result = await CartModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true } // Trả về document đã cập nhật
        );
        return result;
    } catch (error) {
        console.log('Remove cart error:', error);
        throw new Error('Remove cart error');
    }
};

// Khôi phục trạng thái cho shop 
const restoreAndSetAvailable = async (id) => {
    try {
        const cartInDB = await CartModel.findById(id);
        if (!cartInDB) {
            throw new Error('cart not found');
        }

        // Cập nhật trạng thái
        const result = await CartModel.findByIdAndUpdate(
            id,
            { isDeleted: false },
            { new: true } // Trả về document đã cập nhật
        );
        return result;
    } catch (error) {
        console.log('Restore cart error:', error);
        throw new Error('Restore cart error');
    }
  };

module.exports = {
    addToCart,
    deleteCartWhenPayment,
    getCarts,
    getCartByUserAndShop,
    updateQuantityProduct,
    deleteFromCart,
    deleteCartUser,
    removeSoftDeleted,
    restoreAndSetAvailable
};