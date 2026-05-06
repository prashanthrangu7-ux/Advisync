const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CAVI_MODEL = 'llama-3.3-70b-versatile';
const CONTACT_MESSAGE = 'You can contact Advisync at contact@advisync.in or +91-8501033023. Our teams are based in Bangalore and Hyderabad and typically respond within 24 hours.';
const SYSTEM_PROMPT = [
  `You are CAVi, an AI-powered Virtual CFO created by Advisync.

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

If uncertain, clearly say so instead of hallucinating.`,
  'Help website visitors understand Advisync services, GST compliance, ITC reconciliation, TDS reconciliation, AP/AR reconciliation, and how to contact Advisync.',
  'Keep answers concise, practical, and professional. If a request needs personalized tax, legal, or financial advice, recommend contacting Advisync for a consultation.',
].join(' ');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function buildFallbackReply(message) {
  const normalizedMessage = message.toLowerCase();

  if (/\b(contact|email|phone|call|location|address|reach)\b/.test(normalizedMessage)) {
    return CONTACT_MESSAGE;
  }

  if (/\b(gst|itc|tds|ap|ar|reconciliation|income tax|mca|compliance|mis|cash flow|cfo|financial reporting)\b/.test(normalizedMessage)) {
    return `CAVi can help explain Advisync services across GST, ITC reconciliation, TDS reconciliation, AP/AR reconciliation, MCA compliance, financial reporting, MIS analysis, cash-flow insights, and CFO-level advisory. For advice tailored to your business, please contact Advisync at contact@advisync.in or +91-8501033023.`;
  }

  return `Thanks for reaching out. CAVi can help with Advisync services, GST compliance, ITC/TDS reconciliation, AP/AR reconciliation, MIS, cash-flow insights, and CFO advisory. ${CONTACT_MESSAGE}`;
}

function getRequestMessage(body) {
  if (typeof body?.message === 'string') {
    return body.message.trim();
  }

  if (typeof body === 'string') {
    try {
      const parsedBody = JSON.parse(body);
      return typeof parsedBody?.message === 'string' ? parsedBody.message.trim() : '';
    } catch {
      return '';
    }
  }

  return '';
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const message = getRequestMessage(req.body);

  if (!message) {
    return res.status(400).json({ error: 'Please provide a message.' });
  }

  if (!process.env.GROQ_API_KEY) {
    console.warn('GROQ_API_KEY is not configured. Serving the CAVi fallback response.');
    return res.status(200).json({ reply: buildFallbackReply(message), fallback: true });
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
      console.error('CAVi upstream error:', upstreamMessage);
      return res.status(200).json({ reply: buildFallbackReply(message), fallback: true });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error('CAVi upstream returned an empty response.');
      return res.status(200).json({ reply: buildFallbackReply(message), fallback: true });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('CAVi chatbot error:', error);
    return res.status(200).json({ reply: buildFallbackReply(message), fallback: true });
  }
}
