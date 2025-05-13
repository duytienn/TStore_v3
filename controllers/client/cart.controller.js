const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const productHelper = require("../../helpers/product");
// [GET] /cart
module.exports.index = async (req, res) => {
  const cartId = req.cookies.cartId;

  const cart = await Cart.findOne({
    _id: cartId,
  });

  if (cart.products.length > 0) {
    for (const item of cart.products) {
      const productId = item.product_id;

      const productInfo = await Product.findOne({
        _id: productId,
      });

      // Tìm thông tin biến thể cụ thể
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
      
      // Thêm thông tin biến thể vào productInfo
      productInfo.selectedColor = item.color;
      productInfo.selectedMemory = item.memory;

      item.productInfo = productInfo;

      item.totalPrice = item.quantity * productInfo.newPrice;
    }
  }
  //Tong tien ca gio hang
  cart.totalPrice = cart.products.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  res.render("client/pages/cart/index", {
    pageTitle: "Giỏ hàng",
    cart: cart,
  });
};

// [POST] /add/:productId
module.exports.addPost = async (req, res) => {
  const cartId = req.cookies.cartId;
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity);
  
  // Lấy thông tin màu sắc và bộ nhớ từ form
  const color = req.body.color || "";
  const memory = parseInt(req.body.memory) || 0;

  const cart = await Cart.findOne({
    _id: cartId,
  });

  // Cập nhật điều kiện tìm kiếm sản phẩm trong giỏ hàng
  const exitsProductInCart = cart.products.find(
    (item) => 
      item.product_id == productId && 
      item.color == color && 
      item.memory == memory
  );

  if (exitsProductInCart) {
    const newQuantity = quantity + exitsProductInCart.quantity;

    await Cart.updateOne(
      {
        _id: cartId,
        "products.product_id": productId,
        "products.color": color,
        "products.memory": memory
      },
      {
        "products.$.quantity": newQuantity,
      }
    );
  } else {
    const objectCart = {
      product_id: productId,
      quantity: quantity,
      color: color,
      memory: memory
    };

    await Cart.updateOne(
      {
        _id: cartId,
      },
      {
        $push: { products: objectCart },
      }
    );
  }
  req.flash("success", "Thêm sản phẩm vào giỏ hàng thành công !");

  res.redirect("back");
};

// [GET] /deleted/:productId
module.exports.delete = async (req, res) => {
  const productId = req.params.productId;
  const cartId = req.cookies.cartId;
  const color = req.query.color || "";
  const memory = req.query.memory || 0;

  await Cart.updateOne(
    {
      _id: cartId,
    },
    {
      $pull: { 
        products: { 
          product_id: productId,
          color: color,
          memory: parseInt(memory)
        } 
      },
    }
  );

  req.flash("success", "Đã xóa sản phẩm khỏi giỏ hàng thành công !");

  res.redirect("back");
};

// [GET] /update/:productId/:quantity
module.exports.update = async (req, res) => {
  const cartId = req.cookies.cartId;
  const productId = req.params.productId;
  const quantity = req.params.quantity;

  await Cart.updateOne(
    {
      _id: cartId,
      "products.product_id": productId,
    },
    {
      "products.$.quantity": quantity,
    }
  );
  req.flash("success", "Đã cập nhật số lượng thành công !");

  res.redirect("back");
};
