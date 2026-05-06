const CAVI_STANDALONE_API_ENDPOINT =
  "/api/chat";

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
    const chatBox = document.getElementById('chatBox');

    if (!input || !chatBox) return;

    const userMessage = input.value.trim();
    if (!userMessage) return;

    appendCaviMessage(chatBox, 'user', userMessage);
    input.value = '';

    const loadingMessage = appendCaviMessage(chatBox, 'bot', 'CAVi is thinking...');

    try {
        const CAVI_STANDALONE_API_ENDPOINT =
    const CAVI_STANDALONE_API_ENDPOINT =
  "https://advisync.vercel.app/api/chat"; {
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

        loadingMessage.textContent = data.reply || 'I could not generate a response. Please try again.';
    } catch (error) {
        loadingMessage.textContent = 'Sorry, CAVi is unavailable right now. Please try again later or contact Advisync directly.';
    }
}
