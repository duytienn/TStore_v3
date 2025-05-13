const mongoose = require("mongoose");
slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const productSchema = new mongoose.Schema(
  {
    title: String,
    products_category_id: {
      type: String,
      default: "",
    },
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
    // Thêm vào schema của sản phẩm
    variants: [
      {
        color: String,
        memory: Number,
        price: Number,
        discountPercentage: Number,
        stock: Number,
        thumbnail: String
      }
    ],
    description: String,
    color: String,
    memory: Number,
    price: Number,
    discountPercentage: Number,
    rating: Number,
    stock: Number,
    sold: Number,
    brand: String,
    category: String,
    thumbnail: String,
    status: String,
    featured: String,
    position: Number,
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
    createdBy: {
      account_id: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    deletedBy: {
      account_id: String,
      deletedAt: Date,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    updatedBy: [
      {
        account_id: String,
        updatedAt: Date,
      },
    ],
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;