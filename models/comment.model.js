const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    user_id: String,
    slugProduct: String,
    content: String,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
},{
    timestamps: true
});

const Comment = mongoose.model("Comment", commentSchema, "comments");

module.exports = Comment;