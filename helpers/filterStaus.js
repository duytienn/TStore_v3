module.exports = (query) => {
    const filterStatus = [
        {
            class: "",
            status: "",
            name: "Tất cả"
        },
        {
            class: "",
            status: "active",
            name: "Hoạt động"
        },
        {
            class: "",
            status: "inactive",
            name: "Dừng hoạt động"
        }
    ]

    

    // thay doi mau khi an vao nut trong bo loc
    if(query.status){
        const index = filterStatus.findIndex(item => item.status == query.status);
        filterStatus[index].class = "active"
    } else {
        const index = filterStatus.findIndex(item => item.status == "");
        filterStatus[index].class = "active"
    }

    return filterStatus;
}