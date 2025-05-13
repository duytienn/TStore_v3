const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user_id: String,
    cart_id: String,
    userInfo: {
        fullName: String,
        phone: String,
        address: String
    },
    products: [
        {
            product_id: String,
            price: Number,
            discountPercentage: Number,
            quantity: Number,
            color: String,    // Thêm trường này
            memory: Number    // Thêm trường này
        },
    ],
    paymentMethod: {
        type: String,
        default: "cod"  // Giá trị mặc định là COD, có thể là 'qr' hoặc 'crypto'
    },
    status: {
        type: String,
        default: "pending"
    },
    deleted: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;