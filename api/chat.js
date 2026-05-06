const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CAVI_MODEL = 'llama-3.3-70b-versatile';
const SYSTEM_PROMPT = [
  'You are CAVi, an AI-powered Virtual CFO created by Advisync.

Your role is to assist businesses with:
- GST
- Income Tax
- MCA compliance
- Financial reporting
- MIS analysis
- Cash flow insights
- CFO-level advisory

Your tone should be:
- professional
- intelligent
- concise
- business-focused
- helpful to Indian businesses

If uncertain, clearly say so instead of hallucinating.',
  'Help website visitors understand Advisync services, GST compliance, ITC reconciliation, TDS reconciliation, AP/AR reconciliation, and how to contact Advisync.',
  'Keep answers concise, practical, and professional. If a request needs personalized tax, legal, or financial advice, recommend contacting Advisync for a consultation.',
].join(' ');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'Chatbot is not configured on this deployment.' });
  }

  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (!message) {
    return res.status(400).json({ error: 'Please provide a message.' });
  }

  try {
    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: CAVI_MODEL,
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
        max_tokens: 500,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const upstreamMessage = data?.error?.message || 'Chat provider request failed.';
      return res.status(response.status).json({ error: upstreamMessage });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({ error: 'Chat provider returned an empty response.' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('CAVi chatbot error:', error);
    return res.status(500).json({ error: 'Server error occurred.' });
  }
}
