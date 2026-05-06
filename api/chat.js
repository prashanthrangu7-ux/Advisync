export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
                "You are CAVi, an AI-powered Virtual CFO assistant."
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
