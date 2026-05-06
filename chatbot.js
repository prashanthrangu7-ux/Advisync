const CAVI_STANDALONE_API_ENDPOINT = '/api/chat';

function setupStandaloneChatbot() {
    const chat = document.getElementById('chatbox');
    const launcher = document.querySelector('.chat-launcher');
    const input = document.getElementById('userInput');

    if (chat && !chat.hasAttribute('aria-hidden')) {
        chat.setAttribute('aria-hidden', 'true');
    }

    launcher?.setAttribute('aria-expanded', chat?.classList.contains('is-open') ? 'true' : 'false');

    input?.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
}

function toggleChat(forceOpen) {
    const chat = document.getElementById('chatbox');
    const launcher = document.querySelector('.chat-launcher');

    if (!chat) return;

    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !chat.classList.contains('is-open');
    chat.classList.toggle('is-open', shouldOpen);
    chat.setAttribute('aria-hidden', String(!shouldOpen));
    launcher?.setAttribute('aria-expanded', String(shouldOpen));

    if (shouldOpen) {
        setTimeout(() => document.getElementById('userInput')?.focus(), 150);
    }
}

function appendCaviMessage(chatBody, className, message) {
    const messageElement = document.createElement('div');
    messageElement.className = className;
    messageElement.innerText = message;
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;

    return messageElement;
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const chatBody = document.getElementById('chatBody');

    if (!input || !chatBody) return;

    const userMessage = input.value.trim();

    if (!userMessage) return;

    toggleChat(true);
    appendCaviMessage(chatBody, 'user-message', userMessage);
    input.value = '';
    input.disabled = true;

    const loadingMessage = appendCaviMessage(chatBody, 'bot-message is-thinking', 'CAVi is typing...');

    try {
        const response = await fetch(CAVI_STANDALONE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error || 'Unable to get a response right now.');
        }

        loadingMessage.classList.remove('is-thinking');
        loadingMessage.innerText = data.reply || 'I could not generate a response. Please try again.';
    } catch (error) {
        console.error(error);
        loadingMessage.classList.remove('is-thinking');
        loadingMessage.innerText = 'Sorry, CAVi is unavailable right now. Please try again later or contact Advisync directly.';
    } finally {
        input.disabled = false;
        input.focus();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupStandaloneChatbot);
} else {
    setupStandaloneChatbot();
}
