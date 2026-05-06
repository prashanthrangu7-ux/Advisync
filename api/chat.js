const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const SYSTEM_PROMPT = 'You are CAVi, a professional Virtual CFO AI assistant for Advisync. Answer clearly, briefly, and helpfully about finance, tax, compliance, audit, advisory, and related business questions. If a question requires personalized legal, tax, or financial advice, recommend contacting the Advisync team.';

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Groq API key is not configured.' });
    }

    let body;

    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    } catch (error) {
        return res.status(400).json({ error: 'Invalid JSON request body.' });
    }

    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        const groqResponse = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: process.env.GROQ_MODEL || DEFAULT_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT,
                    },
                    {
                        role: 'user',
                        content: message,
                    },
                ],
                temperature: 0.4,
            }),
        });

        const data = await groqResponse.json();

        if (!groqResponse.ok) {
            const errorMessage = data?.error?.message || 'Unable to get a response from Groq.';
            return res.status(groqResponse.status).json({ error: errorMessage });
        }

        const reply = data?.choices?.[0]?.message?.content?.trim();

        if (!reply) {
            return res.status(502).json({ error: 'Groq returned an empty response.' });
        }

        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(500).json({ error: 'Unable to process the chat request.' });
    }
};
