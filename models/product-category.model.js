const mongoose = require("mongoose");
slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const productCategorySchema = new mongoose.Schema({
    title: String,
    code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    full_code: {
        type: String,
        required: true,
        uppercase: true,
        unique: true
    },
    paren_id: {
        type: String,
        default: ""
    },
    description: String,
    thumbnail: String,
    position: Number,
    status: String,
    slug: {
        type: String,
        slug: "title",
        unique: true
    },
    deleted:  {
        type: Boolean,
        default: false
    },
    deletedAt: Date
},{
    timestamps: true
});

const ProductCategory = mongoose.model("ProductCategory", productCategorySchema, "products-category");

module.exports = ProductCategory;