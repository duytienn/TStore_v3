//Cap nhat so luong san pham trong gio hang
const inputQuantity = document.querySelectorAll("input[name='quantity']");
if (inputQuantity.length > 0) {
    inputQuantity.forEach(input => {
        input.addEventListener("change", (e) => {
            const productId = input.getAttribute("product-id");
            const quantity = parseInt(input.value);
            
            // Lấy thông tin màu sắc và bộ nhớ từ data attributes
            const color = input.getAttribute("data-color") || "";
            const memory = input.getAttribute("data-memory") || 0;
            
            if (quantity > 0) {
                // Thêm thông tin biến thể vào URL cập nhật
                window.location.href = `/cart/update/${productId}/${quantity}?color=${color}&memory=${memory}`;
            }  
        });
    });
}
//Het cap nhat so luong san pham trong gio hang