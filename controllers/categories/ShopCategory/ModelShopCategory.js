// khai 1 model category
// (_id, name, description, created_at, updated_at)

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopCategorySchema = new Schema({
    name: { type: String, required: true },
    image: { type: String, required: true, },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },

});

// tên schema viết thường, tiếng anh, số ít
module.exports = mongoose.models.shopCategory ||
    mongoose.model('shopCategory', ShopCategorySchema);


