const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Excel = require('exceljs');
const path = require('path');
const fs = require('fs');

// Hàm tính tổng giá tiền của đơn hàng
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

// Function to format date to Vietnamese format
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

// Function to format currency
const formatCurrency = (number) => {
  return new Intl.NumberFormat('vi-VN').format(number);
};

// [GET] /admin/exports/orders
module.exports.exportForm = async (req, res) => {
  res.render("admin/pages/exports/orders", {
    pageTitle: "Xuất báo cáo đơn hàng",
  });
};

// [POST] /admin/exports/orders
module.exports.exportOrders = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    // Validate input dates
    if (!startDate || !endDate) {
      req.flash("error", "Vui lòng chọn ngày bắt đầu và ngày kết thúc!");
      return res.redirect("back");
    }

    // Adjust endDate to include the entire day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);
    
    // Query orders within date range
    const orders = await Order.find({
      deleted: false,
      status: { $in: ["success", "delivered", "completed"] },
      createdAt: {
        $gte: new Date(startDate),
        $lte: adjustedEndDate
      }
    });
    
    // Collect all product IDs from orders
    const productIds = [];
    orders.forEach(order => {
      order.products.forEach(product => {
        if (product.product_id) {
          productIds.push(product.product_id);
        }
      });
    });
    
    // Fetch all products in one query
    const products = await Product.find({
      _id: { $in: productIds }
    });
    
    // Create a map for quick product lookup
    const productsMap = {};
    products.forEach(product => {
      productsMap[product._id.toString()] = product;
    });

    if (!orders.length) {
      req.flash("error", "Không tìm thấy đơn hàng nào trong khoảng thời gian này!");
      return res.redirect("back");
    }

    // Create Excel workbook
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Thống kê bán hàng');

    // Add header row
    worksheet.columns = [
    { header: 'Mã đơn hàng', key: 'orderId', width: 15 },
    { header: 'Ngày đặt hàng', key: 'orderDate', width: 15 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Tên khách hàng', key: 'customerName', width: 20 },
    { header: 'SĐT', key: 'phone', width: 15 },
    { header: 'Tên sản phẩm', key: 'productName', width: 30 },
    { header: 'Mã sản phẩm', key: 'productCode', width: 15 },
    { header: 'Biến thể', key: 'variant', width: 15 },
    { header: 'Số lượng', key: 'quantity', width: 10 },
    { header: 'Đơn giá', key: 'price', width: 15 },
    { header: 'Thành tiền', key: 'totalPrice', width: 15 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };

    // Add data rows
    let totalRevenue = 0;
    let rowCount = 1;

    orders.forEach(order => {
      order.products.forEach(product => {
        // Lấy thông tin sản phẩm từ map
        const productInfo = productsMap[product.product_id];
        if (!productInfo) return; // Skip if product not found
        
        const price = product.price || 0;
        const discountPercentage = product.discountPercentage || 0;
        const discountedPrice = price * (1 - discountPercentage / 100);
        const quantity = product.quantity || 0;
        const totalProductPrice = discountedPrice * quantity;
        totalRevenue += totalProductPrice;
        
        // Prepare variant string
        const variantInfo = [];
        if (product.color) variantInfo.push(`Màu: ${product.color}`);
        if (product.memory) variantInfo.push(`Bộ nhớ: ${product.memory}GB`);
        const variantString = variantInfo.length ? variantInfo.join(', ') : 'Mặc định';
        
        rowCount++;
        worksheet.addRow({
        orderId: order._id.toString(),
        orderDate: formatDate(order.createdAt),
        status: getStatusText(order.status),
        customerName: order.userInfo?.fullName || 'N/A',
        phone: order.userInfo?.phone || 'N/A',
        productName: productInfo.title || 'Sản phẩm không xác định',
        productCode: productInfo.full_code || 'N/A',  // Thay đổi ở đây
        variant: variantString,
        quantity: quantity,
        price: formatCurrency(discountedPrice),
        totalPrice: formatCurrency(totalProductPrice)
        });
      });
    });

    // Add summary row
    const summaryRowIndex = rowCount + 2;
    worksheet.getCell(`A${summaryRowIndex}`).value = 'Tổng doanh thu:';
    worksheet.getCell(`K${summaryRowIndex}`).value = formatCurrency(totalRevenue);
    worksheet.getCell(`A${summaryRowIndex}`).font = { bold: true };
    worksheet.getCell(`K${summaryRowIndex}`).font = { bold: true };
    
    // Prepare file path
    const date = new Date();
    const timestamp = date.getTime();
    const fileName = `orders_export_${timestamp}.xlsx`;
    const filePath = path.join(__dirname, '../../public/exports', fileName);
    
    // Create directory if it doesn't exist
    const dirPath = path.join(__dirname, '../../public/exports');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Write to file
    await workbook.xlsx.writeFile(filePath);
    
    // Send file as download
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        req.flash("error", "Lỗi khi tải tệp!");
        return res.redirect("back");
      }
      
      // Delete file after download (optional)
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting temporary file:', unlinkErr);
      });
    });
    
  } catch (error) {
    console.error('Error exporting orders:', error);
    req.flash("error", "Có lỗi xảy ra khi xuất file!");
    return res.redirect("back");
  }
};

// Helper function to convert status code to readable text
function getStatusText(status) {
  const statusMap = {
    'pending': 'Chờ xác nhận',
    'processing': 'Đang xử lý',
    'shipping': 'Đang giao hàng',
    'delivered': 'Đã giao hàng',
    'success': 'Thành công',
    'completed': 'Hoàn thành',
    'canceled': 'Đã hủy'
  };
  
  return statusMap[status] || status;
}