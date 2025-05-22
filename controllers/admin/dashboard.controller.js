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
    // Sử dụng giá từ newPrice nếu có (đây là giá đã tính cho biến thể)
    // hoặc tính dựa trên giá gốc và chiết khấu
    const price = product.newPrice || product.price || 0;
    const quantity = product.quantity || 0;
    const discountPercentage = product.discountPercentage || 0;
    
    // Nếu đã có newPrice thì không cần áp dụng giảm giá nữa
    if (product.newPrice) {
      return total + (product.newPrice * quantity);
    } else {
      // Tính giá sau khi giảm giá
      const discountedPrice = price * (1 - discountPercentage / 100);
      return total + (discountedPrice * quantity);
    }
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
  const currentMonth = new Date().getMonth();
  const currentDate = new Date().getDate();
  
  // Khởi tạo mảng doanh thu theo tháng, ngày và tuần
  const monthlyRevenue = Array(12).fill(0);
  const dailyRevenue = Array(31).fill(0); // Tối đa 31 ngày trong tháng
  const weeklyRevenue = Array(7).fill(0); // 7 ngày trong tuần
  
  // Tính ngày đầu tiên của tuần hiện tại (Chủ nhật = 0)
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());

  orders.forEach(order => {
    if (order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const orderTotal = calculateOrderTotal(order.products);
      
      // Tính doanh thu theo tháng
      if (orderDate.getFullYear() === currentYear) {
        const month = orderDate.getMonth();
        monthlyRevenue[month] += orderTotal;
      }
      
      // Tính doanh thu theo ngày trong tháng hiện tại
      if (orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth) {
        const day = orderDate.getDate() - 1; // Đảm bảo index từ 0
        if (day >= 0 && day < dailyRevenue.length) {
          dailyRevenue[day] += orderTotal;
        }
      }
      
      // Tính doanh thu theo ngày trong tuần hiện tại
      const firstDayTime = firstDayOfWeek.getTime();
      const dayDiff = Math.floor((orderDate.getTime() - firstDayTime) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 0 && dayDiff < 7) {
        weeklyRevenue[dayDiff] += orderTotal;
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
    dailyRevenue: dailyRevenue,
    weeklyRevenue: weeklyRevenue,
    productFeatured: productFeatured,
  });
};