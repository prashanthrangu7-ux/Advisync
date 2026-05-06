export default async function handler(req, res) {

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
                "You are CAVi, a professional Virtual CFO AI assistant."
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
        reply: "Groq API Error",
        error: data
      });
    }

    res.status(200).json({
      reply:
        data.choices[0].message.content
    });

  } catch(error) {

    console.log(error);

    res.status(500).json({
      reply: "Server Error",
      error: error.message
    });
  }
}
