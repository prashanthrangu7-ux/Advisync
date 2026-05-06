const CAVI_STANDALONE_API_ENDPOINT = "https://cavi.vercel.app/api/chat";

function appendCaviMessage(chatBox, className, message) {
    const messageElement = document.createElement('div');
    messageElement.className = className;
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;

    return messageElement;
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBody')
        || document.getElementById('chatbox')
        || document.getElementById('chatBox');

    if (!input || !chatBox) return;

    const userMessage = input.value.trim();
    if (!userMessage) return;

    appendCaviMessage(chatBox, 'user-message', userMessage);
    input.value = '';
    input.disabled = true;

    const loadingMessage = appendCaviMessage(chatBox, 'bot-message is-thinking', 'CAVi is thinking...');

    try {
        const response = await fetch(CAVI_STANDALONE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error || 'Unable to get a response right now.');
        }

        loadingMessage.classList.remove('is-thinking');
        loadingMessage.textContent = data.reply || 'I could not generate a response. Please try again.';
    } catch (error) {
        loadingMessage.classList.remove('is-thinking');
        loadingMessage.textContent = 'Sorry, CAVi is unavailable right now. Please try again later or contact Advisync directly.';
    } finally {
        input.disabled = false;
        input.focus();
    }
}
