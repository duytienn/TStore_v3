// Change-status
const buttonChangStatus = document.querySelectorAll("[button-change-status]");
const formChangeStatus = document.querySelector("[form-change-status]");

if (buttonChangStatus.length > 0) {
    buttonChangStatus.forEach(button => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("data-status");
            const id = button.getAttribute("data-id");
            const changeStaus = status == "active" ? "inactive" : "active";
            const path = formChangeStatus.getAttribute("path");
            const action = path + "/" + changeStaus + "/" + id + "?_method=PATCH";
            formChangeStatus.action = action;
            formChangeStatus.submit();
        });
    });
}
// End Change-status

// Delete Item
const buttonDelete = document.querySelectorAll("[button-delete]");
const formDelete = document.querySelector("[form-delete-item]");

if (buttonDelete.length > 0) {
    buttonDelete.forEach(button => {
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có chắc muốn xóa sản phẩm này ?");
            if(isConfirm ){
                const id = button.getAttribute("data-id");
                const path = formDelete.getAttribute("path");
                const action = path + "/" + id + "?_method=DELETE";
                formDelete.action = action;
                formDelete.submit();
            }
        })
    })
}
// End Delete Item