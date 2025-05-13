const RoomChat = require("../../models/room-chat.model");
const Users = require("../../models/users.model");

module.exports = async (res) => {
    
    _io.once('connection', (socket) => {
        // Gui yeu cau ket ban
        socket.on("CLIENT_ADD_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;
            // Them id cua ong A vao acceptFriends cua ong B
            const exitsUserB = await Users.findOne({
                _id: userId,
                acceptFriends: myUserId
            })
            //
            if (!exitsUserB) {
                await Users.updateOne({
                    _id: userId
                }, {
                    $push: { acceptFriends: myUserId }
                })
            };
            // Them id cua ong B vao requestFriends ong A
            const exitsUserA = await Users.findOne({
                _id: myUserId,
                requestFriends: userId
            })
            if (!exitsUserA) {
                await Users.updateOne({
                    _id: myUserId
                }, {
                    $push: { requestFriends: userId }
                })
            }
            // Lay do dai accept cua B tra ve cho B
            const infoUser = await Users.findOne({
                _id: userId
            });

            const lengthAcceptFriends = infoUser.acceptFriends.length; 

            socket.broadcast.emit("SERVER_RETURN_LENGTH_ACCEPT_FRIENDS", {
                userId: userId,
                lengthAcceptFriends: lengthAcceptFriends
            });

            // Lay thong tin cua ong A tra ve cho ong B
            const infoUserA = await Users.findOne({
                _id:myUserId
            }).select("avatar fullName");

            socket.broadcast.emit("SERVER_RETURN_INFOR_ACCEPT_FRIEND", {
                userId: userId,
                infoUserA: infoUserA
            })
        });

        // Huy yeu cau ket ban
        socket.on("CLIENT_CANCEL_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;
            // xOA id cua ong A vao acceptFriends cua ong B
            const exitsUserB = await Users.findOne({
                _id: userId,
                acceptFriends: myUserId
            })
            //
            if (exitsUserB) {
                await Users.updateOne({
                    _id: userId
                }, {
                    $pull: { acceptFriends: myUserId }
                })
            };
            // xoa id cua ong B vao requestFriends ong A
            const exitsUserA = await Users.findOne({
                _id: myUserId,
                requestFriends: userId
            })
            if (exitsUserA) {
                await Users.updateOne({
                    _id: myUserId
                }, {
                    $pull: { requestFriends: userId }
                })
            }
            // Lay do dai accept cua B tra ve cho B
            const infoUser = await Users.findOne({
                _id: userId
            });

            const lengthAcceptFriends = infoUser.acceptFriends.length; 

            socket.broadcast.emit("SERVER_RETURN_LENGTH_ACCEPT_FRIENDS", {
                userId: userId,
                lengthAcceptFriends: lengthAcceptFriends
            });

            // Lay thong tin cua ong A tra ve cho ong B
            socket.broadcast.emit("SERVER_RETURN_USER_ID_CANCEL_FRIEND", {
                userId: userId,
                userIdA: myUserId
            })
        });

        // Tu choi ket ban
        socket.on("CLIENT_REFUSE_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;
            // xOA id cua ong A vao acceptFriends cua ong B
            const exitsUserB = await Users.findOne({
                _id: myUserId,
                acceptFriends: userId
            })
            //
            if (exitsUserB) {
                await Users.updateOne({
                    _id: myUserId
                }, {
                    $pull: { acceptFriends: userId }
                })
            };
            // xoa id cua ong B vao requestFriends ong A
            const exitsUserA = await Users.findOne({
                _id: userId,
                requestFriends: myUserId
            })
            if (exitsUserA) {
                await Users.updateOne({
                    _id: userId
                }, {
                    $pull: { requestFriends: myUserId }
                })
            }
        });

        // Chap nhan ket ban
        socket.on("CLIENT_ACCEPT_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;
            // Them {user_id, room_chat_id} cua A vao friendList cua B
            // xOA id cua ong A vao acceptFriends cua ong B
            const exitsUserB = await Users.findOne({
                _id: myUserId,
                acceptFriends: userId
            })

            const exitsUserA = await Users.findOne({
                _id: userId,
                requestFriends: myUserId
            });

            // Tao phong chat
            let roomChat;
            if (exitsUserA && exitsUserB) {
                roomChat = new RoomChat({
                    typeRoom: "friend",
                    users: [
                        {
                            user_id: userId,
                            role: "superAdmin"
                        },
                        {
                            user_id: myUserId,
                            role: "superAdmin"
                        }
                    ]
                })
            };
            await roomChat.save();

            if (exitsUserB) {
                await Users.updateOne({
                    _id: myUserId
                }, {
                    $push: {
                        friendList: {
                            user_id: userId,
                            room_chat_id: roomChat.id,
                        }
                    },
                    $pull: { acceptFriends: userId }
                })
            };
            // Them {user_id, room_chat_id} cua B vao friendList cua A
            // xoa id cua ong B vao requestFriends ong A
            if (exitsUserA) {
                await Users.updateOne({
                    _id: userId
                }, {
                    $push: {
                        friendList: {
                            user_id: myUserId,
                            room_chat_id: roomChat.id,
                        }
                    },
                    $pull: { requestFriends: myUserId }
                })
            }
        });
    });
} 