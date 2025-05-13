const User = require("../../models/users.model")
const RoomChat = require("../../models/room-chat.model");

// [GET] /rooms-chat/
module.exports.index = async (req, res) => {
    const userId = res.locals.user.id;

    const listRoomChat = await RoomChat.find({
        "users.user_id": userId,
        typeRoom: "group",
        deleted: false
    });

    res.render("client/pages/rooms-chat/index", {
        pageTitle: "Danh sách phòng chat",
        listRoomChat: listRoomChat
    });
};

// [GET] /rooms-chat/create
module.exports.createRoom = async (req, res) => {
    const friendList = res.locals.user.friendList;
    
    for (const friend of friendList) {
        const infoFriend = await User.findOne(
            {
                _id: friend.user_id
            }).select("fullName avatar")
        friend.infoFriend = infoFriend
    }
    res.render("client/pages/rooms-chat/create", {
        pageTitle: "Tạo phòng chat",
        friendList: friendList
    })
}

// [POST] /rooms-chat/create
module.exports.createRoomPost = async (req, res) => {
    const title = req.body.title;
    const userId = req.body.userId;

    const dataChat = {
        title: title,
        typeRoom: "group",
        users: []
    };

    userId.forEach(userId => {
        dataChat.users.push({
            user_id: userId,
            role: "user"
        })
    });
    dataChat.users.push({
        user_id: res.locals.user.id,
        role: "superAdmin"
    });
    const room = new RoomChat(dataChat);
    await room.save();

    res.redirect(`/chat/${room.id}`);
}