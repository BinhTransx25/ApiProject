const ModelProduct = require("../products/ModelProduct");
const ModelUser = require("../users/ModelUser");
const ModelShopOwner = require("../shopowner/ModelShopOwner");
const CartModel = require("./CartModel");
const ObjectId = require('mongoose').Types.ObjectId;

// Thêm 1 sản phẩm vào giỏ hàng 
const addToCart = async (user_id, shopOwner_id, products_id) => {
    try {
        console.log("--- Start addToCart ---");

        const userObjId = new ObjectId(user_id);
        const shopOwnerObjId = new ObjectId(shopOwner_id);

        // Kiểm tra user
        const userInDB = await ModelUser.findById(userObjId);
        if (!userInDB) {
            throw new Error('User not found');
        }

        // Kiểm tra shop
        const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);
        if (!shopOwnerInDB) {
            throw new Error('ShopOwner not found');
        }
        if (shopOwnerInDB.status !== 'Mở cửa') {
            // Chuyển trạng thái isDeleted: true nếu shop không mở cửa
            await CartModel.updateMany(
                { "shopOwner._id": shopOwnerObjId, isDeleted: false },
                { isDeleted: true }
            );
            throw new Error('Shop đã đóng cửa');
        }

        // Kiểm tra sản phẩm
        const productInDB = await ModelProduct.findById(products_id);
        if (!productInDB) {
            throw new Error('Product not found');
        }
        if (productInDB.status !== 'Còn món') {
            // Chuyển trạng thái isDeleted: true nếu sản phẩm không còn món
            await CartModel.updateMany(
                { "shopOwner._id": shopOwnerObjId, isDeleted: false },
                { isDeleted: true }
            );
            throw new Error('Product is not available');
        }

        // Xóa tất cả giỏ hàng cũ bị đánh dấu isDeleted: true
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
            console.log("Cart not found, creating new cart...");
            cart = new CartModel({
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

            await cart.save();
            return cart;
        } else {
            console.log("Cart found, updating...");

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

            await cart.save();
            console.log("Cart updated:", cart);
            return cart;
        }
    } catch (error) {
        console.log("Error in addToCart:", error);
        return { status: false, message: error.message };
    }
};

// Cập nhật số lượng trực tiếp
const updateQuantityProduct = async (user_id, shopOwner_id, product_id, quantity) => {
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
        if (shopOwnerInDB.status !== 'mở cửa') {
            // Nếu shop không phải "mở cửa", đánh dấu tất cả giỏ hàng liên quan là isDeleted: true
            await CartModel.updateMany(
                { 'shopOwner._id': shopOwnerObjId, isDeleted: false },
                { $set: { isDeleted: true } }
            );
            throw new Error('Shop is not open, all related carts are marked as deleted');
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
            throw new Error('User not found');
        }

        // Lấy tất cả các giỏ hàng của người dùng
        let carts = await CartModel.find({ "user._id": userObjId, isDeleted: false });

        if (!carts || carts.length === 0) {
            throw new Error('No carts found');
        }

        // Lặp qua tất cả giỏ hàng để kiểm tra trạng thái của shop và sản phẩm
        for (let cart of carts) {
            const shopOwnerObjId = new ObjectId(cart.shopOwner._id);

            // Kiểm tra trạng thái của shopOwner
            const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);
            if (!shopOwnerInDB) {
                throw new Error('ShopOwner not found');
            }

            if (shopOwnerInDB.status !== "mở cửa") {
                // Nếu shop không mở cửa, set isDeleted cho tất cả giỏ hàng của shopOwner này
                await CartModel.updateMany(
                    { "shopOwner._id": shopOwnerObjId, isDeleted: false },
                    { $set: { isDeleted: true } }
                );
                throw new Error('Shop is closed, all carts have been marked as deleted');
            }

            // Kiểm tra trạng thái của sản phẩm trong giỏ hàng
            for (let product of cart.products) {
                const productObjId = new ObjectId(product._id);
                
                const productInDB = await ModelProduct.findById(productObjId);
                if (!productInDB) {
                    throw new Error('Product not found');
                }

                if (productInDB.status !== "Còn món") {
                    // Nếu sản phẩm không còn món, set isDeleted cho giỏ hàng có chứa sản phẩm này
                    await CartModel.updateMany(
                        { "products._id": productObjId, isDeleted: false },
                        { $set: { isDeleted: true } }
                    );
                    throw new Error('Product is no longer available, cart has been marked as deleted');
                }
            }
        }

        // Trả về danh sách các giỏ hàng với thông tin cần thiết
        const cartList = carts.map(cart => ({
            shopId: cart.shopOwner._id,
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
        throw new Error(error.message);
    }
};

// Lấy chi tiết giỏ hàng của người dùng và shop
// Lấy chi tiết giỏ hàng của người dùng và shop
const getCartByUserAndShop = async (user, shopOwner) => {
    try {
        console.log("--- Start getCartByUserAndShop ---");

        // Tìm giỏ hàng của user và shopOwner
        const cart = await CartModel.findOne({
            "user._id": new ObjectId(user),
            "shopOwner._id": new ObjectId(shopOwner)
        });

        if (!cart) {
            return null; // Không có giỏ hàng nào
        }

        const shopOwnerObjId = new ObjectId(shopOwner);

        // Kiểm tra trạng thái của shopOwner
        const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);
        if (!shopOwnerInDB) {
            throw new Error("ShopOwner not found");
        }

        if (shopOwnerInDB.status !== "Mở cửa") {
            // Nếu shop không mở cửa, set isDeleted cho tất cả giỏ hàng liên quan đến shopOwner
            await CartModel.updateMany(
                { "shopOwner._id": shopOwnerObjId, isDeleted: false },
                { $set: { isDeleted: true } }
            );
            throw new Error("Shop is closed, all carts related to this shop have been marked as deleted");
        } else {
            // Nếu shop mở cửa, cập nhật lại trạng thái isDeleted cho giỏ hàng liên quan
            await CartModel.updateMany(
                { "shopOwner._id": shopOwnerObjId, isDeleted: true },
                { $set: { isDeleted: false } }
            );
        }

        // Kiểm tra trạng thái của các sản phẩm trong giỏ hàng
        for (let product of cart.products) {
            const productObjId = new ObjectId(product._id);

            const productInDB = await ModelProduct.findById(productObjId);
            if (!productInDB) {
                throw new Error("Product not found");
            }

            if (productInDB.status !== "Còn món") {
                // Nếu sản phẩm không còn món, set isDeleted cho giỏ hàng liên quan
                await CartModel.updateMany(
                    { "products._id": productObjId, isDeleted: false },
                    { $set: { isDeleted: true } }
                );
                throw new Error("Product is no longer available, cart has been marked as deleted");
            } else {
                // Nếu sản phẩm còn món, cập nhật lại trạng thái isDeleted
                await CartModel.updateMany(
                    { "products._id": productObjId, isDeleted: true },
                    { $set: { isDeleted: false } }
                );
            }
        }

        // Trả về giỏ hàng đã kiểm tra trạng thái
        console.log("Cart retrieved:", cart);
        return cart;
    } catch (error) {
        console.error(`Error in getCartByUserAndShop: ${error.message}`);
        throw new Error(`Error in getCartByUserAndShop: ${error.message}`);
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