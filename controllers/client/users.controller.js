const Users = require("../../models/users.model");
const userSocket = require("../../sockets/client/users.socket");
// [GET] /users/not-friends
module.exports.notFriends = async (req, res ) => {
    // socketUser
    userSocket(res);
    //socketUser
    const userId = res.locals.user.id;

    const requestFriends = res.locals.user.requestFriends;

    const acceptFriends = res.locals.user.acceptFriends;

    const friendList = res.locals.user.friendList;

    const friendListId = friendList.map(item => item.user_id);

    const users = await Users.find({
        $and: [
            { _id: { $ne : userId } },
            { _id: { $nin: requestFriends } },
            { _id: { $nin: acceptFriends } },
            { _id: { $nin: friendListId } },
        ],
        status: "active",
        deleted: false
    }).select("avatar fullName");



    res.render("client/pages/users/not-friends", {
        pageTitle: "Danh sách người dùng",
        users: users
    })
}

// [GET] /users/request
module.exports.request = async (req, res) => {
    // socketUser
    userSocket(res);
    //socketUser
    const userId = res.locals.user.id;

    const requestFriends = res.locals.user.requestFriends;

    const users = await Users.find({
        _id: { $in : requestFriends },
        status: "active",
        deleted: false,
    }).select("avatar fullName")

    res.render("client/pages/users/request", {
        pageTitle: "Lời mời đã gửi",
        users: users
    })
}

// [GET] /users/accept
module.exports.accept = async (req, res) => {
    // socketUser
    userSocket(res);
    //socketUser
    const userId = res.locals.user.id;

    const acceptFriends = res.locals.user.acceptFriends;

    const users = await Users.find({
        _id: { $in : acceptFriends },
        status: "active",
        deleted: false,
    }).select("avatar fullName")

    res.render("client/pages/users/accept", {
        pageTitle: "Lời mời kết bạn",
        users: users
    })
}

// [GET] /users/friends
module.exports.friends = async (req, res) => {
    // socketUser
    userSocket(res);
    //socketUser
    const userId = res.locals.user.id;

    const friendList = res.locals.user.friendList;

    const friendListId = friendList.map(item => item.user_id);

    const users = await Users.find({
        _id: { $in : friendListId },
        status: "active",
        deleted: false,
    }).select("avatar fullName statusOnline");

    users.forEach(user => {
        const infoUser = friendList.find(item => item.user_id == user.id);
        user.roomChatId = infoUser.room_chat_id;
    });

    res.render("client/pages/users/friends", {
        pageTitle: "Danh sách kết bạn",
        users: users
    });
}
