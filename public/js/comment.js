// CLIENT SEND COMMENT
const formSendComment = document.getElementById('commentForm');

if (formSendComment) {
    formSendComment.addEventListener("submit", (e) => {
        e.preventDefault();
        const content = e.target.elements.comment.value.trim();
        if (content) {
            socket.emit("CLIENT_SEND_COMMENT", {
                content: content
            });

            tinymce.get("commentInput").setContent("");
        }
    })
}
// END CLIENT SEND COMMENT

// SERVER RETURN COMMENT
socket.on("SERVER_RETURN_COMMENT", (data) => {
    const bodyComment = document.querySelector(".comment-list");
    const div = document.createElement("div");
    let htmlFullName = "";
    let htmlContent = "";

    if (data.fullName && data.content) {
        div.classList.add("comment-item");

        htmlFullName += `<div class="comment-author">`
        htmlFullName += `<b>${data.fullName}</b>`
        htmlFullName += `</div>`
        
        htmlContent += `<div class="comment-text">`
        htmlContent += `<b>${data.content}</b>`
        htmlContent += `</div>`
    }
    div.innerHTML = `
        ${htmlFullName}
        ${htmlContent}
    `;
    bodyComment.prepend(div);
})
// END SERVER RETURN COMMENT
