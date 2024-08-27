const ModelProduct = require("../products/ModelProduct");
const ModelUser = require("../users/ModelUser");
const CartModel = require("./CartModel");
const ObjectId = require('mongoose').Types.ObjectId;


const addToCart = async (user, product) => {
    try {
        const userInDB = await ModelUser.findById(user);
        if (!userInDB) {
            throw new Error('User not found');
        }
        const productInDB = await ModelProduct.findById(product);
        if (!productInDB) {
            throw new Error('Product not found');
        }
        user = {
            _id: userInDB._id,
            email: userInDB.email,
        },
            product = {
                _id: productInDB._id,
                name: productInDB.name,
                price: productInDB.price,
                image: productInDB.image,
                quantity: 1
            }
        const productInCart = await CartModel.findOne({ "user._id": new ObjectId(user), "product._id": new ObjectId(product) });
        if (!productInCart) {
            let newCart = new CartModel({ user, product });
            await newCart.save();
            return newCart;
        } else {
            productInCart.quantity += 1;
            productInCart.markModified('product');
            productInCart.updatedAt = Date.now();
            const result = await productInCart.save();
            return result;
        }
    } catch (error) {
        console.log('Error in addToCart:', error);
        throw new Error(error.message);
    }
}

const getCartsByUser = async (user) => {
    try {
        const userInDB = await ModelUser.findById(user);
        if (!userInDB) {
            throw new Error('User not found');
        }
        let carts = await CartModel.find({ 'user._id': new ObjectId(user) });
        return carts;
    } catch (error) {
        console.log('Error in getCartsByUser:', error);
        throw new Error('Error when fetching carts');
    }
}

module.exports = { addToCart, getCartsByUser };