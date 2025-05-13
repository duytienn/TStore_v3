const RoomChat = require("../../models/room-chat.model");

module.exports.inAccess = async (req, res , next) => {
    const userId = res.locals.user.id;
    const roomChatId = req.params.roomChatId;
    try {
        const isAccessRoomChat = await RoomChat.find({
            _id: roomChatId,
            "users.user_id": userId,
            deleted: false
        });

        if(isAccessRoomChat) {
            next();
        } else {
            res.redirect("/");
        }
    } catch (error) {
        res.redirect("/");
    }
}