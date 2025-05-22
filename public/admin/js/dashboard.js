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
    console.warn(`Không tìm thấy dữ liệu cho ${elementId}, sử dụng dữ liệu mặc định`);
    return defaultData;
  }

  // Hàm lấy ngày giờ hiện tại theo UTC+7
  function getCurrentDateTimeUTC7() {
    // Tạo một đối tượng Date mới (theo giờ địa phương của người dùng)
    const now = new Date();
    
    // Tính toán múi giờ UTC+7
    // Lấy độ lệch múi giờ hiện tại của người dùng so với UTC (tính bằng phút)
    const userTimezoneOffset = now.getTimezoneOffset();
    
    // Múi giờ UTC+7 có độ lệch là -420 phút so với UTC (7 giờ * 60 phút)
    const utc7Offset = -420;
    
    // Tính chênh lệch giữa múi giờ hiện tại và UTC+7 (tính bằng phút)
    const offsetDiff = userTimezoneOffset + utc7Offset;
    
    // Tạo một đối tượng Date mới với thời gian đã điều chỉnh
    const utc7DateTime = new Date(now.getTime() + offsetDiff * 60 * 1000);
    
    return utc7DateTime;
  }
  
  // Hàm tạo nhãn ngày cho biểu đồ
  function generateDateLabels(period) {
    const utc7Now = getCurrentDateTimeUTC7();
    const labels = [];
    
    switch(period) {
      case 'year':
        // Tạo nhãn cho các tháng trong năm
        for (let i = 0; i < 12; i++) {
          labels.push(`T${i+1}`);
        }
        break;
        
      case 'month':
        // Xác định số ngày trong tháng hiện tại
        const currentMonth = utc7Now.getMonth();
        const currentYear = utc7Now.getFullYear();
        // Lấy ngày cuối cùng của tháng hiện tại
        const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Tạo nhãn cho mỗi ngày trong tháng
        for (let i = 1; i <= lastDay; i++) {
          labels.push(`${i}`);
        }
        break;
        
      case 'week':
        // Tên các ngày trong tuần theo tiếng Việt
        const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        
        // Lấy ngày hiện tại và tính toán ngày đầu tuần (Thứ 2)
        const currentDayOfWeek = utc7Now.getDay(); // 0 = Chủ nhật, 1 = Thứ hai, ...
        const startOfWeekOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek; // Đưa về thứ 2
        
        // Tạo nhãn cho 7 ngày trong tuần
        for (let i = 0; i < 7; i++) {
          const day = new Date(utc7Now);
          day.setDate(utc7Now.getDate() + startOfWeekOffset + i);
          // Thêm ngày/tháng vào nhãn
          const dayOfMonth = day.getDate();
          const month = day.getMonth() + 1;
          labels.push(`${weekdays[i === 6 ? 0 : i+1]} (${dayOfMonth}/${month})`);
        }
        break;
    }
    
    return labels;
  }

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
    
    // Lấy dữ liệu doanh thu theo các khoảng thời gian từ các thẻ data
    const monthlyRevenueData = getRevenueData("monthly-revenue-data", 12); // 12 tháng
    const dailyRevenueData = getRevenueData("daily-revenue-data", 31); // 31 ngày
    
    console.log("Dữ liệu doanh thu theo tháng:", monthlyRevenueData);
    console.log("Dữ liệu doanh thu theo ngày:", dailyRevenueData);
    
    // Lấy múi giờ UTC+7 hiện tại
    const utc7Now = getCurrentDateTimeUTC7();
    
    // Xác định ngày trong tháng
    const currentDate = utc7Now.getDate();
    // Xác định ngày trong tuần (0 = CN, 1 = T2, ...)
    const currentDayOfWeek = utc7Now.getDay();
    // Tính offset để lấy ngày đầu tuần (thứ 2)
    const startOfWeekOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    
    switch(period) {
      case 'year':
        chartData.labels = generateDateLabels('year');
        chartData.data = monthlyRevenueData;
        chartData.title = "Doanh thu theo tháng";
        break;
      case 'month':
        // Tạo nhãn cho các ngày trong tháng
        chartData.labels = generateDateLabels('month');
        chartData.data = dailyRevenueData.slice(0, chartData.labels.length);
        chartData.title = `Doanh thu tháng ${utc7Now.getMonth() + 1}/${utc7Now.getFullYear()} (UTC+7)`;
        break;
      case 'week':
        // Tạo nhãn cho các ngày trong tuần
        chartData.labels = generateDateLabels('week');
        
        // Tạo mảng chứa dữ liệu doanh thu cho tuần
        let weeklyRevenueData = Array(7).fill(0);
        
        // Xác định các ngày trong tuần hiện tại để lấy dữ liệu chính xác từ dữ liệu theo ngày
        for (let i = 0; i < 7; i++) {
          const weekDay = new Date(utc7Now);
          weekDay.setDate(utc7Now.getDate() + startOfWeekOffset + i);
          const dayOfMonth = weekDay.getDate(); // Ngày trong tháng
          
          // Lấy dữ liệu từ mảng dailyRevenueData (chỉ số mảng bắt đầu từ 0, ngày bắt đầu từ 1)
          if (dayOfMonth >= 1 && dayOfMonth <= dailyRevenueData.length) {
            weeklyRevenueData[i] = dailyRevenueData[dayOfMonth - 1];
          }
        }
        
        chartData.data = weeklyRevenueData;
        chartData.title = "Doanh thu tuần hiện tại (UTC+7)";
        break;
    }

    console.log(`Đang tạo biểu đồ cho giai đoạn: ${period} (UTC+7)`, chartData);
    
    // Thêm thông tin UTC+7 vào tiêu đề
    const timeInfoElement = document.querySelector(".time-info");
    if (timeInfoElement) {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      timeInfoElement.textContent = `Dữ liệu cập nhật: ${utc7Now.toLocaleDateString('vi-VN', options)} (UTC+7)`;
    }
    
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