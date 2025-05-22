const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");
const productHelper = require("../../helpers/product");
const totalPriceHelper = require("../../helpers/totalPrice");

//[GET] /checkout/cod
module.exports.cod = async (req, res) => {
  const cartId = req.cookies.cartId;

  const cart = await Cart.findOne({
    _id: cartId,
  });

  // tinh tong tien san pham trong mang products
  await totalPriceHelper(cart);

  // if (cart.products.length > 0) {
  //     for (const item of cart.products) {
  //         const productId = item.product_id;

  //         const productInfo = await Product.findOne({
  //             _id: productId
  //         });

  //         productInfo.newPrice = productHelper.priceNewProduct(productInfo);

  //         item.productInfo = productInfo;

  //         item.totalPrice = item.quantity * productInfo.newPrice;
  //     }
  // };
  //Tong tien ca gio hang
  cart.totalPrice = cart.products.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  res.render("client/pages/checkout/index", {
    pageTitle: "Đặt hàng",
    cart: cart,
  });
};

//[GET] /checkout/qr
module.exports.qr = async (req, res) => {
  const cartId = req.cookies.cartId;

  const cart = await Cart.findOne({
    _id: cartId,
  });

  // tinh tong tien san pham trong mang products
  await totalPriceHelper(cart);

  // if (cart.products.length > 0) {
  //     for (const item of cart.products) {
  //         const productId = item.product_id;

  //         const productInfo = await Product.findOne({
  //             _id: productId
  //         });

  //         productInfo.newPrice = productHelper.priceNewProduct(productInfo);

  //         item.productInfo = productInfo;

  //         item.totalPrice = item.quantity * productInfo.newPrice;
  //     }
  // };
  //Tong tien ca gio hang
  cart.totalPrice = cart.products.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  //qrBank
  let qrBank = {
    BANK_ID: process.env.BANK_ID,
    ACCOUNT_NO: process.env.ACCOUNT_NO,
    ACCOUNT_NAME: process.env.ACCOUNT_NAME,
  };

  res.render("client/pages/checkout/payqr", {
    pageTitle: "Đặt hàng",
    cart: cart,
    qrBank: qrBank,
  });
};

//[POST] /checkout/order
module.exports.order = async (req, res) => {
  const user_id = res.locals.user.id;
  const cartId = req.cookies.cartId;
  const userInfo = req.body;
  const cart = await Cart.findOne({
    _id: cartId,
  });

  let products = [];

  // Trong các phương thức xử lý đơn hàng
  for (const item of cart.products) {
    const objectProducts = {
      product_id: item.product_id,
      price: 0,
      discountPercentage: 0,
      quantity: item.quantity,
      color: item.color,        
      memory: item.memory 
    };
    const productInfo = await Product.findOne({
      _id: item.product_id,
    });
    
    // Lấy giá của biến thể cụ thể nếu có
    if ((item.color || item.memory) && productInfo.variants && productInfo.variants.length > 0) {
      // Tìm biến thể phù hợp
      const variant = productInfo.variants.find(v => 
        (!item.color || v.color === item.color) && 
        (!item.memory || v.memory === item.memory)
      );
      
      // Nếu tìm thấy biến thể, sử dụng giá của nó
      if (variant && variant.price) {
        objectProducts.price = variant.price;
        // Lưu giá đã tính cho biến thể để sử dụng sau này
        objectProducts.newPrice = variant.price * (1 - (productInfo.discountPercentage || 0) / 100);
      } else {
        objectProducts.price = productInfo.price;
      }
    } else {
      objectProducts.price = productInfo.price;
    }
    
    objectProducts.discountPercentage = productInfo.discountPercentage;
    products.push(objectProducts);
  }
  const objectOrder = {
    user_id: user_id,
    cart_id: cartId,
    userInfo: userInfo,
    products: products,
  };

  const order = new Order(objectOrder);
  await order.save();
  //Cap nhat lai gio hang sau khi dat hang thanh cong , xoa het products
  await Cart.updateOne({ _id: cartId }, { products: [] });

  res.redirect(`/checkout/success/${order.id}`);
};

//[POST] /checkout/orderqr
module.exports.orderQr = async (req, res) => {
  try {
    const totalPrice = parseInt(req.body.totalPrice);

    const response = await fetch(
      "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgpMegPgtjsvi_Cg_uekDmwKQX30q1SaIJFS0BO0zWkjOuNq--VSnnWb2DdtM4otiCMFC4S_-7PMu37OTxD44Jsza_D20iTeK09aYzBbMryuK-cFeheyoc0J23iEP4U_6OLfEhwLMfqIsQSGXN3qM6eSy_QZbt1VoOVyISeuwC98oUKw-0WgQog5weStW1ad2Q4EbL9nudhFQSKG39_8ykvn8Bm7Tz0uCBqT4z1suTlPSIATFmFMUF5-horsAsJq3MyZfuzM16oYlcuOrxYjVSC6rVK0w&lib=MakyA0FHssmjeXXQlfGGCZ0SZlvIfKm0s"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const dataTotalPrice = data.data[data.data.length - 1]["Giá trị"];

    if (totalPrice == dataTotalPrice) {
      const user_id = res.locals.user.id;
      const cartId = req.cookies.cartId;
      const userInfo = req.body;
      const cart = await Cart.findOne({
        _id: cartId,
      });

      let products = [];

      // Trong các phương thức xử lý đơn hàng
      for (const item of cart.products) {
        const objectProducts = {
          product_id: item.product_id,
          price: 0,
          discountPercentage: 0,
          quantity: item.quantity,
          color: item.color,        
          memory: item.memory 
        };
        const productInfo = await Product.findOne({
          _id: item.product_id,
        });
        
        // Lấy giá của biến thể cụ thể nếu có
        if ((item.color || item.memory) && productInfo.variants && productInfo.variants.length > 0) {
          // Tìm biến thể phù hợp
          const variant = productInfo.variants.find(v => 
            (!item.color || v.color === item.color) && 
            (!item.memory || v.memory === item.memory)
          );
          
          // Nếu tìm thấy biến thể, sử dụng giá của nó
          if (variant && variant.price) {
            objectProducts.price = variant.price;
            // Lưu giá đã tính cho biến thể để sử dụng sau này
            objectProducts.newPrice = variant.price * (1 - (productInfo.discountPercentage || 0) / 100);
          } else {
            objectProducts.price = productInfo.price;
          }
        } else {
          objectProducts.price = productInfo.price;
        }
        
        objectProducts.discountPercentage = productInfo.discountPercentage;
        products.push(objectProducts);
      }
      const objectOrder = {
        user_id: user_id,
        cart_id: cartId,
        userInfo: userInfo,
        products: products,
        paymentMethod: 'qr'
      };

      const order = new Order(objectOrder);
      await order.save();
      //Cap nhat lai gio hang sau khi dat hang thanh cong , xoa het products
      await Cart.updateOne({ _id: cartId }, { products: [] });

      res.redirect(`/checkout/success/${order.id}`);
    } else {
      req.flash("error", "Kiểm tra lại giao dịch của bạn !");
      res.redirect("back");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};




// [GET] /checkout/crypto
module.exports.crypto = async (req, res, next) => {
  try {
    const cartId = req.cookies.cartId;
    const cart   = await Cart.findOne({ _id: cartId });
    // tính lại totalPrice
    await totalPriceHelper(cart);
    cart.totalPrice = cart.products.reduce((sum, i) => sum + i.totalPrice, 0);

    // tỉ giá VNĐ → USDT
    const RATE = process.env.USDT_RATE ? Number(process.env.USDT_RATE) : 26000;
    const usdtAmount = (cart.totalPrice / RATE).toFixed(6);

    res.render("client/pages/checkout/crypto", {
      pageTitle: "Thanh toán bằng Crypto",
      cart,
      usdtAmount,      // giá trị mặc định hiển thị
      rate: RATE,      // để nếu bạn muốn show tỉ giá
      recipient: process.env.USDT_RECIPIENT // có thể khai báo trong .env
    });
  } catch (err) {
    next(err);
  }
};

// [POST] /checkout/order-crypto
module.exports.orderCrypto = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const cartId = req.cookies.cartId;
    const userInfo = req.body;

    const cart = await Cart.findOne({ _id: cartId });

    let products = [];

    // Trong các phương thức xử lý đơn hàng
    for (const item of cart.products) {
      const objectProducts = {
        product_id: item.product_id,
        price: 0,
        discountPercentage: 0,
        quantity: item.quantity,
        color: item.color,        
        memory: item.memory 
      };
      const productInfo = await Product.findOne({
        _id: item.product_id,
      });
      
      // Lấy giá của biến thể cụ thể nếu có
      if ((item.color || item.memory) && productInfo.variants && productInfo.variants.length > 0) {
        // Tìm biến thể phù hợp
        const variant = productInfo.variants.find(v => 
          (!item.color || v.color === item.color) && 
          (!item.memory || v.memory === item.memory)
        );
        
        // Nếu tìm thấy biến thể, sử dụng giá của nó
        if (variant && variant.price) {
          objectProducts.price = variant.price;
          // Lưu giá đã tính cho biến thể để sử dụng sau này
          objectProducts.newPrice = variant.price * (1 - (productInfo.discountPercentage || 0) / 100);
        } else {
          objectProducts.price = productInfo.price;
        }
      } else {
        objectProducts.price = productInfo.price;
      }
      
      objectProducts.discountPercentage = productInfo.discountPercentage;
      products.push(objectProducts);
    }

    const objectOrder = {
      user_id: user_id,
      cart_id: cartId,
      userInfo: userInfo,
      products: products,
      paymentMethod: 'crypto'
    };

    const order = new Order(objectOrder);
    await order.save();

    // Xóa cart
    await Cart.updateOne({ _id: cartId }, { products: [] });

    res.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Error creating order:", error);
    res.json({ success: false, error: error.message });
  }
};





//[GET] /checkout/success/:id
module.exports.success = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
  });

  for (const product of order.products) {
    const productInfo = await Product.findOne({
      _id: product.product_id,
    }).select("title thumbnail");

    product.productInfo = productInfo;

    product.newPrice = productHelper.priceNewProduct(product);

    product.totalPrice = product.quantity * product.newPrice;
  }

  //Tong tien
  order.totalPrice = order.products.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  res.render("client/pages/checkout/success", {
    pageTitle: "Đặt hàng thành công",
    order: order,
  });
};
