import * as Popper from 'https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js';
import { FileUploadWithPreview } from 'https://unpkg.com/file-upload-with-preview/dist/index.js';

// //FILE UPLOAD WITH PREVIEW
const upload = new FileUploadWithPreview('upload-img', {
    multiple: true,
    maxFileCount: 6
});
// // //END FILE UPLOAD WITH PREVIEW


// CLIENT SEND MESSAGE
const formSendData = document.querySelector(".chatbot .inner-form");
if (formSendData) {
    formSendData.addEventListener("submit", (e) => {
        e.preventDefault();
        const content = e.target.elements.content.value;
        const images = upload.cachedFileArray || [];

        if(content || images.length > 0) {
            socket.emit("CLIENT_SEND_MESSAGE", {
                content: content,
                images: images
            });
            e.target.elements.content.value = "";
            upload.resetPreviewPanel();

            socket.emit("SERVER_SEND_TYPING","hidden");
        }
    })
}
// END CLIENT SEND MESSAGE

// SEVER RETURN MESSAGE
socket.on("SERVER_RETURN_MESSAGE", (data) => {
    const bodyChat = document.querySelector(".chatbox");
    const myId = document.querySelector("[my-id]").getAttribute("my-id");
    const li = document.createElement("li");
    const boxTyping = document.querySelector(".chat.typing");
    let htmlFullName = "";
    let htmlContent = "";
    let htmlImages = "";

    if (myId == data.user_id) {
        li.classList.add("chat", "outgoing");
    } else {
        li.classList.add("chat", "incoming");
        htmlFullName += `<div class="inner-name">`
        htmlFullName += `<b>${data.fullName}</b>`;
        htmlFullName += `</div>`
    };
    if (data.content) {
            htmlContent += `<div class="inner-content">`;
            htmlContent += `<p>${data.content}</p>`;
            htmlContent += `</div>`
    };
    if (data.images.length > 0) {
        if (myId == data.user_id){
            htmlImages += `<div class="inner-images">`;
            for (const image of data.images) {
                htmlImages += `<img src="${image}">`
            };
            htmlImages += `</div>`;
        } else {
            for (const image of data.images) {
                htmlImages += `<img src="${image}">`
            };
            htmlImages += `</div>`;
        }
    };
    li.innerHTML = `
        ${htmlFullName}
        ${htmlContent}
        ${htmlImages}
    `;   
    bodyChat.insertBefore(li, boxTyping);
    bodyChat.scrollTop = bodyChat.scrollHeight;
    // ZOOM IMAGES FULL SCREEN
    const gallery = new Viewer(li);
})
// END SEVER RETURN MESSAGE

// SCROLL CHAT TO BOTTOM
const bodyChat = document.querySelector(".chatbox");
if (bodyChat) {
    bodyChat.scrollTop = bodyChat.scrollHeight;
}
// END SCROLL CHAT TO BOTTOM

// SHOW TYPING
var timeOut;
const showTyping = () => {
    socket.emit("SERVER_SEND_TYPING","show");

    clearTimeout(timeOut);

    timeOut = setTimeout(() => {
            socket.emit("SERVER_SEND_TYPING","hidden");
    }, 3000)
}
// END SHOW TYPING

// emoji-picker
const buttonIcon = document.querySelector(".button-emo");
if (buttonIcon) {
    const tooltip = document.querySelector('.tooltip');
    Popper.createPopper(buttonIcon, tooltip);

    buttonIcon.addEventListener("click", () => {
        tooltip.classList.toggle('shown');
    })
}

const input = document.querySelector(".chat-input input[name='content']");
const emo = document.querySelector("emoji-picker");
if (emo) {
    emo.addEventListener("emoji-click", (e) => {
        const icon = e.detail.unicode;
        input.value = input.value + icon;
        const end = input.value.length;
        input.setSelectionRange(end, end);
        input.focus();
        showTyping();
    })
}

// emoji-picker

// SEVER SEND TYPING
const inputTyping = document.querySelector(".chat-input input[name='content']");
if (inputTyping) {
    inputTyping.addEventListener("keyup", () => {
        showTyping();
    });

}
// END SEVER SEND TYPING

// SEVER RETURN TYPING
socket.on("SERVER_RETURN_TYPING", (data) => {
    const bodyChat = document.querySelector(".chatbox");
    if (data.type == "show") {
        const exitsTyping = document.querySelector(`[user-id="${data.user_id}"]`);
        if (!exitsTyping) {
            const bodyTyping = document.querySelector(".chat.typing");
            const div = document.createElement("div");
            div.classList.add("box-typing");
            div.setAttribute("user-id", data.user_id);
            div.innerHTML = `
                <b class="inner-name">${data.fullName}</b>
                <div class="inner-dots">
                    <span> </span>
                    <span> </span>
                    <span> </span>
                </div>
            `
            bodyTyping.appendChild(div);
            bodyChat.scrollTop = bodyChat.scrollHeight;
        }
    } else {
        const boxTypingRemove = document.querySelector(`[user-id="${data.user_id}"]`);

        if (boxTypingRemove) {
            const bodyTyping = document.querySelector(".chat.typing");
            bodyTyping.removeChild(boxTypingRemove);
        }
    }
    
})
// END SEVER RETURN TYPING

// ZOOM IMAGES FULL SCREEN
const bodyChatPreview = document.querySelector(".chatbox");
if (bodyChatPreview) {
    const gallery = new Viewer(bodyChatPreview);
}
// END ZOOM IMAGES FULL SCREEN

