export default async function handler(req, res) {

  // CORS
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are CAVi, an AI-powered Virtual CFO created by Advisync.

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

If uncertain, clearly say so instead of hallucinating."
            },
            {
              role: "user",
              content: req.body.message
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log(data);

    if (!data.choices) {
      return res.status(500).json({
        reply: "Groq API error",
        error: data
      });
    }

    return res.status(200).json({
      reply:
        data.choices[0].message.content
    });

  } catch(error) {

    console.log(error);

    return res.status(500).json({
      reply: "Server error occurred."
    });
  }
}
