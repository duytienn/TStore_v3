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
      const order = await Order.findOne({ _id: id }).populate('products.product_id');

      for (const product of order.products) {
        const productInOrder = product.product_id;

        if (!productInOrder) continue; // Bỏ qua nếu không tìm thấy sản phẩm

        const newStock = parseInt(productInOrder.stock - product.quantity);
        const newSold = parseInt(productInOrder.sold + product.quantity);

        const updateData = {
          stock: newStock,
          sold: newSold,
        };

        // Cập nhật stock cho biến thể tương ứng nếu có
        if (product.color || product.memory) {
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
          { _id: product.product_id._id },
          { $set: updateData }
        );
      }

      // Ví dụ: Tính doanh thu tổng từ đơn hàng (nếu cần)
      // const revenue = order.products.reduce((total, product) => {
      //   return total + product.newPrice * product.quantity;
      // }, 0);
    }


    req.flash("success", "Cập nhật trạng thái thành công!");
    res.redirect("back");
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    req.flash("error", "Không thể cập nhật trạng thái!");
    res.redirect("back");
  }
};
