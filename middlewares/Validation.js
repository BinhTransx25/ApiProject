
const validateProduct = async (req, res, next) => {
    try {
        const { name, price, quantity, images, category, description } = req.body;
        if(!price || isNaN(price) || price <= 0) {
            throw new Error('Price is invalid');
        }
        // nếu mọi thứ ok thì chuyển sang middleware tiếp theo
        next();
    } catch (error) {
        console.log('validate product error:', error);
        return res.status(500).json({ status: false, error: error });
    }
}

module.exports = {
    validateProduct
}