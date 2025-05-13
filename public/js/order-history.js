// Cancel order
const listButtonCancel = document.querySelectorAll(".btn-cancel");
const formCancelOrder = document.querySelector("[form-cancel-order]");

if (listButtonCancel) {
    listButtonCancel.forEach(buttonCancel => {
        buttonCancel.addEventListener("click", (e) => {
            const orderId = buttonCancel.getAttribute("data-id");
            const path = formCancelOrder.getAttribute("path");
            const action = path + "/" + orderId + "?_method=DELETE";
            formCancelOrder.action = action;
            console.log(formCancelOrder.action);
            formCancelOrder.submit();
        })
    });
}