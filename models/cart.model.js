const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user_id: String,
    products: [
        {
            product_id: String,
            quantity: Number,
            color: String,    // Thêm trường này
            memory: Number,   // Thêm trường này
            variant_id: String // Thêm trường này (nếu có id riêng cho từng biến thể)
        },
    ],
},{
    timestamps: true
});

const Cart = mongoose.model("Cart", cartSchema, "carts");

module.exports = Cart;

