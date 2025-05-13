// Select status orders
const listSelectStatus = document.querySelectorAll("#order-status-select");
const formChangeStatus = document.querySelector("[form-change-statusOrder]");

if (listSelectStatus) {
  const changeSelectColor = (selectStatus, status) => {
    selectStatus.classList.remove(
      "bg-info",
      "bg-success",
      "bg-danger",
      "bg-warning"
    );

    if (status === "delivering") {
      selectStatus.classList.add("bg-info");
    } else if (status === "success") {
      selectStatus.classList.add("bg-success");
    } else if (status === "refuse") {
      selectStatus.classList.add("bg-danger");
    } else if (status === "pending") {
      selectStatus.classList.add("bg-warning");
    }
  };

  listSelectStatus.forEach((selectStatus) => {
    const initialStatus = selectStatus.value;
    changeSelectColor(selectStatus, initialStatus);

    // Vô hiệu hóa nếu trạng thái ban đầu là success
    if (initialStatus === "success") {
      selectStatus.disabled = true;
    }

    selectStatus.addEventListener("change", (e) => {
      const status = e.target.value;

      // Nếu trạng thái chuyển sang success, vô hiệu hóa thẻ <select>
      if (status === "success") {
        selectStatus.disabled = true;
      }

      changeSelectColor(selectStatus, status);
      const id = selectStatus.getAttribute("data-id");
      const path = formChangeStatus.getAttribute("path");
      const action = path + "/" + status + "/" + id + "?_method=PATCH";
      formChangeStatus.action = action;
      formChangeStatus.submit();
    });
  });
}
// End select status orders
