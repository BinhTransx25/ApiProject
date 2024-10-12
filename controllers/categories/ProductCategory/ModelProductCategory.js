const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductCategorySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    image: { type: Array, required: true, default: [] },
    shopOwner: { 
        shopOwner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopOwner', required: true },
        shopOwner_name: { type: String, required: true }
    }
});

// Ensure the model is not recompiled during hot-reloading in dev
module.exports = mongoose.models.ProductCategory || 
                 mongoose.model('ProductCategory', ProductCategorySchema);
