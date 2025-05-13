const ProductCategory = require("../../models/product-category.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");

// Function to format number to VND currency
const formatCurrency = (number) => {
  return new Intl.NumberFormat('vi-VN').format(number);
};

// Tính tổng giá trị đơn hàng từ danh sách sản phẩm
const calculateOrderTotal = (products) => {
  if (!products || !Array.isArray(products)) return 0;
  
  return products.reduce((total, product) => {
    const price = product.price || 0;
    const quantity = product.quantity || 0;
    const discountPercentage = product.discountPercentage || 0;
    
    // Tính giá sau khi giảm giá
    const discountedPrice = price * (1 - discountPercentage / 100);
    
    return total + (discountedPrice * quantity);
  }, 0);
};

// [GET] admin/dashboard
module.exports.dashboard = async (req, res) => {
  const statistic = {
    categoryProduct: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    product: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    account: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    user: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    order: {
      total: 0,
      active: 0,
      inactive: 0,
    },
  };
  
  // Tính toán thống kê danh mục sản phẩm
  statistic.categoryProduct.total = await ProductCategory.countDocuments({
    deleted: false,
  });
  statistic.categoryProduct.active = await ProductCategory.countDocuments({
    deleted: false,
    status: "active",
  });
  statistic.categoryProduct.inactive = await ProductCategory.countDocuments({
    deleted: false,
    status: "inactive",
  });

  // Tính toán thống kê sản phẩm
  statistic.product.total = await Product.countDocuments({
    deleted: false,
  });
  statistic.product.active = await Product.countDocuments({
    deleted: false,
    status: "active",
  });
  statistic.product.inactive = await Product.countDocuments({
    deleted: false,
    status: "inactive",
  });

  // Tính toán thống kê đơn hàng
  statistic.order.total = await Order.countDocuments({});
  statistic.order.active = await Order.countDocuments({
    deleted: false,
  });
  statistic.order.inactive = await Order.countDocuments({
    deleted: true,
  });

  // Tính tổng doanh thu từ đơn hàng
  const orders = await Order.find({
    deleted: false,
    status: { $in: ["success", "delivered", "completed"] } // Chỉ tính các đơn hàng đã hoàn thành
  });
  
  let totalRevenue = 0;
  orders.forEach(order => {
    // Tính tổng giá trị đơn hàng dựa trên danh sách sản phẩm
    const orderTotal = calculateOrderTotal(order.products);
    totalRevenue += orderTotal;
  });

  // Định dạng doanh thu
  const formattedRevenue = formatCurrency(totalRevenue);

  // Tính doanh thu theo tháng cho năm hiện tại
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = Array(12).fill(0);

  orders.forEach(order => {
    if (order.createdAt) {
      const orderDate = new Date(order.createdAt);
      if (orderDate.getFullYear() === currentYear) {
        const month = orderDate.getMonth();
        const orderTotal = calculateOrderTotal(order.products);
        monthlyRevenue[month] += orderTotal;
      }
    }
  });

  // Lấy ra sản phẩm nổi bật
  let sortSold = {
    sold: "desc",
  };
  const productFeatured = await Product.find({
    deleted: false,
    status: "active",
  })
    .sort(sortSold)
    .limit(4);

  res.render("admin/pages/dashboard/index", {
    pageTitle: "Trang tổng quan",
    statistic: statistic,
    totalRevenue: formattedRevenue,
    monthlyRevenue: monthlyRevenue,
    productFeatured: productFeatured,
  });
};