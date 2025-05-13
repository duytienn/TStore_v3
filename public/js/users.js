// Chuc nang gui yeu cau kb
const listBtnAddFriends = document.querySelectorAll("[btn-add-friend]");
if (listBtnAddFriends.length > 0) {
    listBtnAddFriends.forEach(button => {
        button.addEventListener("click", () => {
            button.closest(".box-user").classList.add("add");
            const userId = button.getAttribute("btn-add-friend");

            socket.emit("CLIENT_ADD_FRIEND", userId);
        })
    })
}
// het chuc nang gui yeu cau kb

// Chuc nang huy kb
const listBtnCancelFriends = document.querySelectorAll("[btn-cancel-friend]");
if (listBtnCancelFriends.length > 0) {
    listBtnCancelFriends.forEach(button => {
        button.addEventListener("click", () => {
            button.closest(".box-user").classList.remove("add");
            const userId = button.getAttribute("btn-cancel-friend");

            socket.emit("CLIENT_CANCEL_FRIEND", userId);
        })
    })
}
// het chuc nang huy kb

// Chuc nang tu choi kb
const listBtnRefuseFriends = document.querySelectorAll("[btn-refuse-friend]");
if (listBtnRefuseFriends.length > 0) {
    listBtnRefuseFriends.forEach(button => {
        button.addEventListener("click", () => {
            button.closest(".box-user").classList.add("refuse");
            const userId = button.getAttribute("btn-refuse-friend");

            socket.emit("CLIENT_REFUSE_FRIEND", userId);
        })
    })
}
// het chuc nang ty choi kb

// Chuc nang chap nhan kb
const listBtnAcceptFriends = document.querySelectorAll("[btn-accept-friend]");
if (listBtnAcceptFriends.length > 0) {
    listBtnAcceptFriends.forEach(button => {
        button.addEventListener("click", () => {
            button.closest(".box-user").classList.add("accepted");
            const userId = button.getAttribute("btn-accept-friend");

            socket.emit("CLIENT_ACCEPT_FRIEND", userId);
        })
    })
}
// het chuc nang chap nhan kb

// SERVER_RETURN_LENGTH_ACCEPT_FRIEND
socket.on("SERVER_RETURN_LENGTH_ACCEPT_FRIENDS", (data) => {
    const bagdeAcceptFriends = document.querySelector("[badge-users-accept]");
    const userId = document.getAttribute("badge-users-accept");

    if (userId == data.userId){
        bagdeAcceptFriends.innerHTML = data.lengthAcceptFriends;
    }
})
// END SERVER_RETURN_LENGTH_ACCEPT_FRIEND


// SERVER_RETURN_INFOR_ACCEPT_FRIEND
socket.on("SERVER_RETURN_INFOR_ACCEPT_FRIEND", (data) => {
    // Trang loi moi ket ban
    const dataAcceptFriends = document.querySelector("[data-users-accept]");
    if (dataAcceptFriends) {
        const userId = document.getAttribute("data-users-accept");
        if (userId == data.userId){
            // Ve user ra giao dien
            const newBoxUer = document.createElement("div");
            newBoxUer.classList.add("col-3");
            newBoxUer.setAttribute("user-id", data.infoUserA._id);
    
            newBoxUer.innerHTML = `
                <div class="box-user">
                    <div class="inner-avatar">
                        <img src=${(data.infoUserA.avatar ? data.infoUserA.avatar : "/images/avatar.jfif")} alt=${data.infoUserA.fullName}>
                    </div>
                    <div class="inner-info">
                        <div class="inner-name">${data.infoUserA.fullName}</div>
                    <div class="inner-buttons">
                        <button class="btn btn-sm btn-primary mr-1" btn-accept-friend=${data.infoUserA._id}>Chấp nhận</button>
                        <button class="btn btn-sm btn-secondary mr-1" btn-refuse-friend=${data.infoUserA._id}>Xóa</button>
                        <button class="btn btn-sm btn-secondary mr-1" btn-deleted-friend=${data.infoUserA.id}disable="disable">Đã xóa</button>
                        <button class="btn btn-sm btn-secondary mr-1" btn-accepted-friend=${data.infoUserA.id} disable="disable">Đã chấp nhận</button>
                        </div>
                    </div>
                </div>
            `
            dataAcceptFriends.appendChild(newBoxUer);
    
            // Xoa loi moi ket ban
            const btnRefuseFriend = document.querySelector("[btn-refuse-friend]");
            btnRefuseFriend.addEventListener("click", () => {
                btnRefuseFriend.closest(".box-user").classList.add("refuse");
                const userId = btnRefuseFriend.getAttribute("btn-refuse-friend");
    
                socket.emit("CLIENT_REFUSE_FRIEND", userId);
            });
            // Chap nhan loi moi ket ban
            const btnAcceptFriend = document.querySelector("[btn-accept-friend]");
            btnAcceptFriend.addEventListener("click", () => {
                btnAcceptFriend.closest(".box-user").classList.add("accepted");
                const userId = btnAcceptFriend.getAttribute("btn-accept-friend");
    
                socket.emit("CLIENT_ACCEPT_FRIEND", userId);
            });
        }
    }
    // Trang danh sach nguoi dung
    const dataUserNotFriends = document.querySelector("data-users-not-friend");
    if (dataUserNotFriends) {
        const userId = document.getAttribute("data-users-not-friend");
        if (userId == data.userId) {
            // Xoa A khoi danh sach cua B
            const boxUserRemove = document.querySelector(`[user-id=${data.infoUserA._id}]`);
            if(boxUserRemove) {
                dataAcceptFriends.removeChild(boxUserRemove);
            }
        }
    }

})
// END SERVER_RETURN_INFOR_ACCEPT_FRIEND

// SERVER_RETURN_USER_ID_CANCEL_FRIEND
socket.on("SERVER_RETURN_USER_ID_CANCEL_FRIEND", (data) => {
    const dataAcceptFriends = document.querySelector("[data-users-accept]");
    const userId = document.getAttribute("data-users-accept");

    if (userId == data.userId) {
        // Xoa A khoi danh sach cua B
        const boxUserRemove = document.querySelector(`[user-id=${data.userIdA}]`);
        if (boxUserRemove) {
            dataAcceptFriends.removeChild(boxUserRemove);
        }
    }
})
// END SERVER_RETURN_USER_ID_CANCEL_FRIEND

// USER_ONLINE, OFFLINE
const userStatus = (userId, status) => {
    const dataUserFriend = document.querySelector("[data-user-friend]");
    if (dataUserFriend) {
            const boxUser = dataUserFriend.querySelector(`[user-id="${userId}"]`);
        if (boxUser) {
            boxUser.querySelector("[status]").setAttribute("status", status);
        }
    }
}
// USER_ONLINE, OFFLINE

// SERVER_RETURN_USER_ONLINE
socket.on("SERVER_RETURN_USER_ONLINE", (userId) => {
    userStatus(userId, "online");
})
// END SERVER_RETURN_USER_ONLINE

// SERVER_RETURN_USER_OFFLINE
socket.on("SERVER_RETURN_USER_OFFLINE", (userId) => {
    userStatus(userId, "offline");
})
// END SERVER_RETURN_USER_OFFLINE
