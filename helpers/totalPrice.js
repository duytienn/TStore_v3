// File helpers/totalPrice.js
const Product = require("../models/product.model");
const productHelper = require("./product");

module.exports = async (cart) => {
  if (cart.products.length > 0) {
    for (const item of cart.products) {
      const productId = item.product_id;

      const productInfo = await Product.findOne({
        _id: productId
      });

      // Thêm đoạn code này để lấy thông tin biến thể
      let variantInfo = null;
      if (productInfo.variants && productInfo.variants.length > 0) {
        variantInfo = productInfo.variants.find(v => 
          v.color === item.color && v.memory === item.memory
        );
      }

      // Sử dụng giá từ biến thể nếu có
      if (variantInfo) {
        productInfo.price = variantInfo.price;
        productInfo.discountPercentage = variantInfo.discountPercentage;
        productInfo.thumbnail = variantInfo.thumbnail || productInfo.thumbnail;
      }

      productInfo.newPrice = productHelper.priceNewProduct(productInfo);
      
      item.productInfo = productInfo;
      item.totalPrice = item.quantity * productInfo.newPrice;
    }
  }
};