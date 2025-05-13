const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const totalPriceHelper = require("../../helpers/totalPrice");

// [GET] /admin/orders
module.exports.index = async (req, res) => {
  const orders = await Order.find({
    deleted: false,
  });

  if (orders) {
    for (const order of orders) {
      await totalPriceHelper(order);
      order.totalPrice = order.products.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
    }
  }
  res.render("admin/pages/orders/index", {
    pageTile: "Đơn hàng",
    orders: orders,
  });
};

// [PATCH] /admin/orders/change-status/:status/:id
module.exports.patchStatus = async (req, res) => {
  try {
    const { status, id } = req.params;

    await Order.updateOne(
      { _id: id },
      {
        status: status,
      }
    );

    if (status === "success") {
      const order = await Order.findOne({
        _id: id,
      });
      const products = order.products;
      for (const product of products) {
        const productInOrder = await Product.findOne({
          _id: product.product_id,
        });
        const newStock = parseInt(productInOrder.stock - product.quantity);
        const newSold = parseInt(productInOrder.sold + product.quantity);
        
        // Cập nhật stock, sold cho sản phẩm chính
        const updateData = {
          stock: newStock,
          sold: newSold,
        };
        
        // Cập nhật stock cho biến thể tương ứng nếu có
        if (product.color || product.memory) {
          // Tìm và cập nhật biến thể phù hợp
          const variantIndex = productInOrder.variants.findIndex(variant => 
            ((!product.color || variant.color === product.color) && 
             (!product.memory || variant.memory === product.memory))
          );
          
          if (variantIndex !== -1) {
            const updatePath = `variants.${variantIndex}.stock`;
            updateData[updatePath] = productInOrder.variants[variantIndex].stock - product.quantity;
          }
        }
        
        await Product.updateOne(
          { _id: product.product_id },
          updateData
        );
      }
    }

    req.flash("success", "Cập nhật trạng thái thành công!");
    res.redirect("back");
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    req.flash("error", "Không thể cập nhật trạng thái!");
    res.redirect("back");
  }
};
