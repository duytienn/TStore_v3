const formGPT = document.querySelector('.formGpt');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

const loader = (e) => {
    e.textContent = '';

    loadInterval = setInterval(() => {
        e.textContent += '.';

        if (e.textContent === '....') {
            e.textContent = '';
        }
    }, 300)
};

const typeText = (e, text) => {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            e.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20)
} 

const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

const chatStripe = (isAi, value, uniqueId) => {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src="${isAi ? '/images/bot.svg' : '/images/user.svg'}"
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(formGPT);

    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

    formGPT.reset();

    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, "", uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueId);

    loader(messageDiv);

    const response = await fetch('http://localhost:3001/chat-gpt', {  
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')  
        })
    });

    clearInterval(loadInterval)
    messageDiv.innerHTML = " ";

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() 
        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
    
}

if (formGPT) {
    formGPT.addEventListener("submit", handleSubmit);
}
