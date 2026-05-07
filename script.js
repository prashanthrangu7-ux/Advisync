// ===== PAGE INTERACTIONS =====
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));

            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function setupFadeInOnScroll() {
    const faders = document.querySelectorAll('.fade-in');

    if (!faders.length) return;

    if (!('IntersectionObserver' in window)) {
        faders.forEach(el => el.classList.add('show'));
        return;
    }

    const appearOptions = {
        threshold: 0.2,
    };

    const appearOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    faders.forEach(el => {
        appearOnScroll.observe(el);
    });
}

function setupHeaderEffects() {
    const header = document.querySelector('header');

    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = '#0B1F3A';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        } else {
            header.style.background = 'rgba(11, 31, 58, 0.95)';
            header.style.boxShadow = 'none';
        }
    });
}

function setupNavigation() {
    const nav = document.querySelector('header nav');
    const navLinks = document.querySelectorAll('header nav a');
    const navToggle = document.getElementById('navToggle');

    if (navToggle && nav) {
        if (!nav.id) {
            nav.id = 'primaryNav';
        }

        navToggle.setAttribute('aria-controls', nav.id);
        navToggle.addEventListener('click', () => {
            const isOpen = document.body.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    navLinks.forEach(link => {
        if (link.href === window.location.href) {
            link.style.color = '#D4AF37';
        }

        link.addEventListener('click', () => {
            document.body.classList.remove('nav-open');
            navToggle?.setAttribute('aria-expanded', 'false');
        });
    });
}

function setupFormValidation() {
    const form = document.querySelector('form');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        const name = form.querySelector('input[name="name"]');
        const email = form.querySelector('input[name="email"]');
        const message = form.querySelector('textarea[name="message"]');

        if (!name?.value || !email?.value || !message?.value) {
            e.preventDefault();
            alert('Please fill all required fields.');
            return;
        }

        if (!email.value.includes('@')) {
            e.preventDefault();
            alert('Enter a valid email address.');
        }
    });
}

function setupButtonFeedback() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.style.transform = 'scale(0.96)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

function setupContactOptions() {
    const toggleBtn = document.getElementById('contactToggle');
    const options = document.querySelector('.contact-options');

    if (toggleBtn && options) {
        toggleBtn.addEventListener('click', () => {
            options.classList.toggle('show');
        });
    }
}

function setupPageInteractions() {
    setupSmoothScroll();
    setupFadeInOnScroll();
    setupHeaderEffects();
    setupNavigation();
    setupFormValidation();
    setupButtonFeedback();
    setupContactOptions();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPageInteractions);
} else {
    setupPageInteractions();
}

// ===== CHATBOT =====
const CAVI_API_ENDPOINT = '/api/chat';
const CAVI_FALLBACK_REPLY = 'I can help with Advisync services, GST compliance, ITC/TDS reconciliation, AP/AR reconciliation, MIS, cash-flow insights, and CFO advisory. You can contact Advisync at contact@advisync.in or +91-8501033023.';

async function parseChatResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    return {};
}


function createChatbotWidget() {
    const widget = document.createElement('div');
    widget.className = 'chatbot-container';
    widget.innerHTML = `
        <div class="chatbot-box" id="chatbox" aria-live="polite">
            <div class="chat-header">
                <div class="chat-profile">
                    <div class="chat-avatar" aria-hidden="true">A</div>
                    <div>
                        <span>CAVi - Your Virtual Assistant</span>
                        <small>Online • typically replies instantly</small>
                    </div>
                </div>
                <button type="button" class="chat-close" onclick="toggleChat()" aria-label="Close chat">×</button>
            </div>

            <div class="chat-body" id="chatBody">
                <div class="bot-message">Hi 👋 I’m your CAVi - Your Virtual Assistant. How can I help you today?</div>
            </div>

            <div class="chat-input">
                <input type="text" id="userInput" placeholder="Type a message" aria-label="Type your message to CAVi - Your Virtual Assistant">
                <button type="button" onclick="sendMessage()" aria-label="Send message">➤</button>
            </div>
        </div>

        <button type="button" class="chat-launcher" onclick="toggleChat()" aria-label="Open CAVi - Your Virtual Assistant chat">
            💬
        </button>
    `;
    document.body.appendChild(widget);

    return widget;
}

function setupChatbot() {
    const widget = document.querySelector('.chatbot-container') || createChatbotWidget();
    const chat = widget.querySelector('#chatbox');
    const launcher = widget.querySelector('.chat-launcher');
    const input = widget.querySelector('#userInput');

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

function appendChatMessage(chatBody, className, message) {
    const messageElement = document.createElement('div');
    messageElement.className = className;
    messageElement.innerText = message;
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;

    return messageElement;
}

// SEND MESSAGE
async function sendMessage() {
    const input = document.getElementById('userInput');
    const chatBody = document.getElementById('chatBody');

    if (!input || !chatBody) return;

    const userText = input.value.trim();
    if (!userText) return;

    toggleChat(true);
    appendChatMessage(chatBody, 'user-message', userText);
    input.value = '';
    input.disabled = true;

    const botMsg = appendChatMessage(chatBody, 'bot-message is-thinking', 'CAVi is typing...');

    try {
        const response = await fetch(CAVI_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userText }),
        });

        const data = await parseChatResponse(response);

        if (!response.ok) {
            throw new Error(data?.error || 'Unable to get a response right now.');
        }

        botMsg.classList.remove('is-thinking');
        botMsg.innerText = data.reply || CAVI_FALLBACK_REPLY;
    } catch (error) {
        console.error(error);
        botMsg.classList.remove('is-thinking');
        botMsg.innerText = CAVI_FALLBACK_REPLY;
    } finally {
        input.disabled = false;
        input.focus();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupChatbot);
} else {
    setupChatbot();
}
