const Users = require("../../models/users.model");
module.exports.userOnline = async (data) => {
    const userId = data;

    _io.once('connection', (socket) => {
        socket.broadcast.emit("SERVER_RETURN_USER_ONLINE", (userId))
    });
} 

module.exports.userOffline = async (data) => {
    const userId = data;

    _io.once('connection', (socket) => {
        socket.broadcast.emit("SERVER_RETURN_USER_OFFLINE", (userId))
    });
} 