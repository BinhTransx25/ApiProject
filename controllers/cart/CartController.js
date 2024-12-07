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
        if (["Đóng cửa", "Ngưng hoạt động", "Tài khoản bị khóa"].includes(shopOwnerInDB.status)) {
            errors = {
                shopId: shopOwnerInDB._id,
                status: shopOwnerInDB.status
            }
            return { errors }

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
            });

            await newCart.save();
            return { status: true, message: 'Cart tạo thành công', carts: newCart };
        } else {
            console.log("Cart đã tồn tại, cập nhật...");

            const productIndex = existingCart.products.findIndex((p) =>
                p._id.equals(productInDB._id)
            );

            if (productIndex > -1) {
                // Nếu sản phẩm đã tồn tại trong giỏ hàng, tăng số lượng
                let existingProduct = existingCart.products[productIndex];
                existingProduct.quantity += 1;

                // Cập nhật lại sản phẩm đã được chỉnh sửa
                existingCart.products[productIndex] = existingProduct;
            } else {
                // Nếu sản phẩm chưa có trong giỏ, thêm sản phẩm mới với quantity = 1
                existingCart.products.push({
                    _id: productInDB._id,
                    name: productInDB.name,
                    price: productInDB.price,
                    images: productInDB.images,
                    soldOut: productInDB.soldOut,
                    quantity: 1,
                });
            }

            // Cập nhật lại tổng số sản phẩm và tổng giá
            existingCart.totalItem = existingCart.products.reduce(
                (acc, product) => acc + product.quantity, 0);
            existingCart.totalPrice = existingCart.products.reduce(
                (acc, product) => acc + product.price * product.quantity, 0);
            existingCart.updatedAt = Date.now();

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
            return { status: false, message: 'User not found' };
        }

        // Lấy thông tin shop
        const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);
        if (!shopOwnerInDB) {
            return { status: false, message: 'ShopOwner not found' };
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
            return { status: false, message: 'Product not found' };
        }

        // Kiểm tra trạng thái của sản phẩm
        if (productInDB.status !== 'Còn món') {
            // Xóa giỏ hàng liên quan
            await CartModel.deleteMany({ 'products._id': productObjId });
            return { status: false, message: 'Product is out of stock. All related carts have been deleted.' };
        }

        // Tìm giỏ hàng của user với shopOwner tương ứng
        const cart = await CartModel.findOne({
            'user._id': userObjId,
            'shopOwner._id': shopOwnerObjId,
        });

        if (!cart) {
            return { status: false, message: 'Cart not found' };
        }

        // Kiểm tra sản phẩm trong giỏ hàng
        const productIndex = cart.products.findIndex((p) => p._id.equals(productObjId));
        if (productIndex === -1) {
            return { status: false, message: 'Product not found in cart' };
        }

        if (quantity === 0) {
            // Nếu quantity = 0, xóa sản phẩm khỏi giỏ hàng
            console.log("Removing product from cart as quantity is 0...");
            cart.products.splice(productIndex, 1);

            // Cập nhật lại tổng số lượng và tổng giá
            cart.totalItem = cart.products.reduce((acc, product) => acc + product.quantity, 0);
            cart.totalPrice = cart.products.reduce((acc, product) => acc + product.price * product.quantity, 0);

            if (cart.products.length === 0) {
                // Nếu giỏ hàng rỗng, xóa giỏ hàng
                await CartModel.deleteOne({ _id: cart._id });
                console.log("Cart is empty, deleting cart...");
                return { status: true, message: "Cart deleted as it is empty" };
            }

            await cart.save();
            console.log("Cart updated successfully:", cart);
            return { status: true, message: "Product removed from cart", cart };
        } else {
            // Cập nhật số lượng sản phẩm nếu quantity > 0
            console.log(`Updating product quantity to ${quantity}...`);

            let existingProduct = cart.products[productIndex];
            existingProduct.quantity = quantity;

            cart.products[productIndex] = existingProduct;

            // Tính lại tổng số lượng và tổng giá
            cart.totalItem = cart.products.reduce((acc, product) => acc + product.quantity, 0);
            cart.totalPrice = cart.products.reduce((acc, product) => acc + product.price * product.quantity, 0);

            cart.updatedAt = Date.now();
            await cart.save();

            console.log("Cart updated successfully:", cart);
            return { status: true, message: "Cart updated successfully", cart };
        }
    } catch (error) {
        console.log("Error in updateQuantityProduct:", error);
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
        if (!userInDB) throw new Error('User not found');

        // Kiểm tra shopOwner
        const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);
        if (!shopOwnerInDB) throw new Error('ShopOwner not found');

        // Kiểm tra trạng thái của cửa hàng
        if (shopOwnerInDB.status !== "Mở cửa") {
            // Xóa cart nếu đã tạo
            const deletedCart = await CartModel.findOneAndDelete({
                "user._id": userObjId,
                "shopOwner._id": shopOwnerObjId,
            });
            return {
                status: false,
                message: 'Shop is closed, cart deleted',
                cartDeleted: !!deletedCart, // Thông báo xem cart có được xóa hay không
            };
        }

        // Kiểm tra sản phẩm
        const productInDB = await ModelProduct.findById(productObjId);
        if (!productInDB) throw new Error('Product not found');

        // Kiểm tra trạng thái của sản phẩm
        if (productInDB.status !== "Còn món") {
            // Xóa cart nếu chứa sản phẩm
            const deletedCart = await CartModel.findOneAndDelete({
                "user._id": userObjId,
                "shopOwner._id": shopOwnerObjId,
                "products._id": productObjId,
            });
            return {
                status: false,
                message: 'Product is no longer available, cart deleted',
                cartDeleted: !!deletedCart, // Thông báo xem cart có được xóa hay không
            };
        }

        // Tìm giỏ hàng hiện tại
        let cart = await CartModel.findOne({
            "user._id": userObjId,
            "shopOwner._id": shopOwnerObjId,
        });

        if (!cart) throw new Error('Cart not found');

        // Tìm và kiểm tra sản phẩm trong giỏ hàng
        const productIndex = cart.products.findIndex((p) =>
            p._id.equals(productObjId)
        );
        if (productIndex === -1) throw new Error('Product not found in cart');

        const existingProduct = cart.products[productIndex];

        // Xử lý giảm số lượng hoặc xóa sản phẩm
        if (existingProduct.quantity > 1) {
            existingProduct.quantity -= 1;
            cart.products[productIndex] = existingProduct;
        } else {
            cart.products.splice(productIndex, 1);
        }

        // Cập nhật tổng số lượng, tổng giá
        cart.totalItem = cart.products.reduce((acc, product) => acc + product.quantity, 0);
        cart.totalPrice = cart.products.reduce((acc, product) => acc + product.price * product.quantity, 0);
        cart.updatedAt = Date.now();

        // Xóa giỏ hàng nếu trống
        if (cart.products.length === 0) {
            await CartModel.deleteOne({ _id: cart._id });
            return { status: true, message: 'Cart is empty and deleted' };
        }

        // Lưu lại giỏ hàng
        await cart.save();
        return { status: true, cart };

    } catch (error) {
        console.log('Error in deleteFromCart:', error);
        return { status: false, message: error.message };
    }
};


// Lấy tất cả giỏ hàng của người dùng 
// chỗ này nếu cart bị xóa sẽ bẩn thông báo 
// load lại lần nữa sẽ cập nhật đúng danh sách cart 
// tuyệt đỉnh BE
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
            return { carts: [], errors: { reason: "No carts found" } };
        }

        const results = [];
        let errors = null;

        // Lặp qua tất cả giỏ hàng để kiểm tra trạng thái của shop và sản phẩm
        for (let cart of carts) {
            const shopOwnerObjId = new ObjectId(cart.shopOwner._id);

            // Kiểm tra trạng thái của shopOwner
            const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);
            if (!shopOwnerInDB) {
                errors[cart.shopOwner._id] = "ShopOwner not found";
                // Vẫn thêm giỏ hàng nhưng gắn cờ lỗi
                results.push({
                    shopId: cart.shopOwner._id,
                    shopName: cart.shopOwner.name,
                    shopImage: cart.shopOwner.images,
                    shopAddress: cart.shopOwner.address,
                    totalItem: cart.totalItem,
                    totalPrice: cart.totalPrice,
                    error: "ShopOwner not found",
                });
                continue;
            }

            if (["Đóng cửa", "Ngưng hoạt động", "Tài khoản bị khóa"].includes(shopOwnerInDB.status)) {
                errors = {
                    shopId: shopOwnerInDB._id,
                    status: shopOwnerInDB.status
                };
                // Vẫn thêm giỏ hàng nhưng gắn cờ lỗi
                // results.push({
                //     shopId: cart.shopOwner._id,
                //     shopName: cart.shopOwner.name,
                //     shopImage: cart.shopOwner.images,
                //     shopAddress: cart.shopOwner.address,
                //     totalItem: cart.totalItem,
                //     totalPrice: cart.totalPrice,
                //     error: `${shopOwnerInDB.status}`,
                // });
                continue;
            }

            // Kiểm tra trạng thái của sản phẩm trong giỏ hàng
            for (let product of cart.products) {
                const productObjId = new ObjectId(product._id);

                const productInDB = await ModelProduct.findById(productObjId);
                if (!productInDB) {
                    errors[product.name] = "Product not found";
                    continue;
                }

                if (productInDB.status !== "Còn món") {
                    errors = {
                        product_id: productInDB._id,
                        status: productInDB.status
                    };
                    continue;
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

        // Trả về giỏ hàng và danh sách lỗi
        return { carts: results, errors: Object.keys(errors).length > 0 ? errors : null };
    } catch (error) {
        console.log("Error in getCarts:", error);
        return { carts: null, errors: { reason: `Lỗi hệ thống: ${error.message}` } };
    }
};

// Lấy chi tiết giỏ hàng của người dùng và shop
const getCartByUserAndShop = async (user, shopOwner) => {
    let errors = {};

    try {
        // Tìm giỏ hàng của user và shopOwner
        const carts = await CartModel.findOne({
            "user._id": new ObjectId(user),
            "shopOwner._id": new ObjectId(shopOwner),
        });

        if (!carts) {
            return { carts: null, errors: { reason: "Giỏ hàng không tồn tại." } };
        }

        // Kiểm tra trạng thái của shopOwner
        const shopOwnerObjId = new ObjectId(shopOwner);
        const shopOwnerInDB = await ModelShopOwner.findById(shopOwnerObjId);

        if (!shopOwnerInDB) {
            return { carts: null, errors: { reason: "Shop owner không tồn tại." } };
        }

        if (["Đóng cửa", "Ngưng hoạt động", "Tài khoản bị khóa"].includes(shopOwnerInDB.status)) {
            // Nếu shop không mở cửa, vẫn trả về giỏ hàng nhưng gắn cờ lỗi
            errors = {
                shopId: shopOwnerInDB._id,
                status: shopOwnerInDB.status
            };
        }

        // Kiểm tra trạng thái của từng sản phẩm trong giỏ hàng
        for (let product of carts.products) {
            const productObjId = new ObjectId(product._id);
            const productInDB = await ModelProduct.findById(productObjId);

            if (!productInDB) {
                errors = {
                    Product_name: "Sản phẩm không tồn tại.",

                };
                continue;
            }

            if (productInDB.status !== "Còn món") {
                errors = {
                    Product_id: productInDB._id,
                    status: productInDB.status
                };
            }
        }

        // Trả về giỏ hàng và lỗi (nếu có)
        return { carts, errors: Object.keys(errors).length > 0 ? errors : null };
    } catch (error) {
        // Nếu lỗi xảy ra trong try-catch
        return { cart: null, errors: { reason: `Lỗi hệ thống: ${error.message}` } };
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