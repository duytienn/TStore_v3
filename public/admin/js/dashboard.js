document.addEventListener("DOMContentLoaded", function() {
  // Khởi tạo biến để lưu trữ chart doanh thu
  let revenueChart = null;
  
  // Hàm lấy dữ liệu doanh thu từ element
  function getRevenueData(elementId, defaultLength) {
    const defaultData = Array(defaultLength).fill(0);
    const element = document.getElementById(elementId);
    
    if (element && element.dataset.revenue) {
      try {
        // Parse dữ liệu từ data attribute
        const revenueString = element.dataset.revenue;
        return revenueString.split(',').map(value => parseInt(value.trim(), 10));
      } catch (error) {
        console.error(`Lỗi khi phân tích dữ liệu doanh thu từ ${elementId}:`, error);
        return defaultData;
      }
    }
    console.warn(`Không tìm thấy dữ liệu cho ${elementId}`);
    return defaultData;
  }

  // Lấy dữ liệu doanh thu theo các khoảng thời gian - di chuyển xuống đây để đảm bảo DOM đã load
  const monthlyRevenueData = getRevenueData("monthly-revenue-data", 12); // 12 tháng
  const dailyRevenueData = getRevenueData("daily-revenue-data", 30);     // 30 ngày
  const weeklyRevenueData = getRevenueData("weekly-revenue-data", 7);    // 7 ngày
  
  console.log("Dữ liệu doanh thu theo tháng:", monthlyRevenueData);
  console.log("Dữ liệu doanh thu theo ngày:", dailyRevenueData);
  console.log("Dữ liệu doanh thu theo tuần:", weeklyRevenueData);

  // Hàm tạo biểu đồ doanh thu
  function createRevenueChart(period = 'year') {
    const ctx = document.querySelector(".prog-chart");
    if (!ctx) {
      console.error("Không tìm thấy canvas cho biểu đồ doanh thu");
      return;
    }
    
    // Hủy chart cũ nếu tồn tại
    if (revenueChart) {
      revenueChart.destroy();
    }
    
    // Cấu hình dữ liệu dựa trên khoảng thời gian
    let chartData = {
      labels: [],
      data: [],
      title: ""
    };
    
    switch(period) {
      case 'year':
        chartData.labels = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
        chartData.data = monthlyRevenueData;
        chartData.title = "Doanh thu theo tháng";
        break;
      case 'month':
        // Tạo labels cho từng ngày trong tháng
        chartData.labels = Array.from({length: dailyRevenueData.length}, (_, i) => `${i + 1}`);
        chartData.data = dailyRevenueData;
        chartData.title = "Doanh thu theo ngày trong tháng";
        break;
      case 'week':
        // Lấy tên các ngày trong tuần
        const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        chartData.labels = weekdays;
        chartData.data = weeklyRevenueData;
        chartData.title = "Doanh thu theo ngày trong tuần";
        break;
    }

    console.log(`Đang tạo biểu đồ cho giai đoạn: ${period}`, chartData);
    
    // Tạo biểu đồ mới
    revenueChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: chartData.title + " (VNĐ)",
            data: chartData.data,
            borderColor: "#0891b2",
            backgroundColor: "rgba(8, 145, 178, 0.7)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true, // Đảm bảo trục y bắt đầu từ 0
            ticks: {
              display: true,
              callback: function(value) {
                // Format số tiền
                return value.toLocaleString('vi-VN') + ' đ';
              }
            },
            border: {
              display: false,
              dash: [5, 5],
            },
          },
        },
        plugins: {
          legend: {
            display: true,
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                // Format số tiền trong tooltip
                return context.dataset.label + ': ' + context.raw.toLocaleString('vi-VN') + ' đ';
              }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: "easeInOutQuad",
        },
      },
    });
    
    return revenueChart;
  }

  // Xử lý sự kiện click trên tabs
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault();
      
      // Xóa class active khỏi tất cả buttons
      tabButtons.forEach(btn => btn.classList.remove("active"));
      
      // Thêm class active cho button được click
      this.classList.add("active");
      
      // Lấy khoảng thời gian từ data attribute
      const period = this.getAttribute("data-period");
      
      // Tạo lại biểu đồ với khoảng thời gian mới
      createRevenueChart(period);
    });
  });

  // Khởi tạo biểu đồ doanh thu mặc định (1 năm)
  createRevenueChart('year');

  // Biểu đồ sản phẩm bán chạy
  // Lấy tất cả các thẻ div có class "product"
  const productDivs = document.querySelectorAll(".product");

  // Tạo mảng chứa dữ liệu sản phẩm
  const products = [];

  // Duyệt qua các thẻ div
  for (let i = 0; i < productDivs.length; i += 2) {
    // Kiểm tra nếu thẻ hiện tại có thuộc tính data-product
    if (productDivs[i] && productDivs[i].hasAttribute("data-product")) {
      const productSold = productDivs[i].getAttribute("data-product"); // Lấy số lượng bán
      if (i + 1 < productDivs.length && productDivs[i + 1] && productDivs[i + 1].hasAttribute("data-title")) {
        const productTitle = productDivs[i + 1].getAttribute("data-title"); // Lấy tên sản phẩm
        products.push({
          title: productTitle,
          sold: parseInt(productSold, 10) || 0, // Chuyển thành số và đảm bảo không phải NaN
        });
      }
    }
  }
  
  // Chỉ lấy dữ liệu cho biểu đồ nếu có sản phẩm
  if (products.length > 0) {
    const labels = products.map((product) => product.title);
    const data = products.map((product) => product.sold);

    // Plugin custom để thêm màu nền cho canvas
    const customCanvasBackgroundColor = {
      id: "customCanvasBackgroundColor",
      beforeDraw: (chart, args, options) => {
        const { ctx } = chart;
        ctx.save();
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = options.color || "#f0f8ff"; // Màu nền mặc định
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      },
    };

    // Khởi tạo biểu đồ Doughnut với plugin
    const ctx2 = document.querySelector(".prog-chart2");
    if (ctx2) {
      new Chart(ctx2, {
        type: "doughnut", // Loại biểu đồ Doughnut
        data: {
          labels: labels,
          datasets: [
            {
              label: "Số lượng sản phẩm đã bán",
              data: data,
              backgroundColor: [
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(255, 205, 86)",
                "rgb(153, 102, 255)",
                "rgb(75, 192, 192)",
                "rgb(255, 159, 64)",
                "rgb(201, 203, 207)"
              ],
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: "top", // Hiển thị chú thích ở trên biểu đồ
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw;
                  const label = context.label || '';
                  const percentage = Math.round((value / data.reduce((a, b) => a + b, 0)) * 100);
                  return `${label}: ${value} sản phẩm (${percentage}%)`;
                }
              }
            },
            customCanvasBackgroundColor: {
              color: "#f0f8ff", // Màu nền cho canvas
            },
          },
        },
        plugins: [customCanvasBackgroundColor]
      });
    } else {
      console.error("Không tìm thấy canvas cho biểu đồ sản phẩm bán chạy");
    }
  } else {
    console.warn("Không có dữ liệu sản phẩm để hiển thị biểu đồ");
  }
});