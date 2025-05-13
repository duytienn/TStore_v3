const Comment = require("../../models/comment.model");

module.exports = async (req, res) => {
    if (res.locals.user) {
        const userId = res.locals.user.id;
        const fullName = res.locals.user.fullName;
        const slugProduct = req.params.slugProduct;

        _io.once('connection', (socket) => {
            socket.join(slugProduct);

            socket.on("CLIENT_SEND_COMMENT", async (data) => {
                const comment = new Comment({
                    user_id: userId,
                    slugProduct: slugProduct,
                    content: data.content,
                });
                await comment.save();
                _io.to(slugProduct).emit("SERVER_RETURN_COMMENT", {
                    userId: userId,
                    fullName: fullName,
                    content: data.content
                });
            });
        });
    }
}