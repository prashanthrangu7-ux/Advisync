async function sendMessage() {

    const input = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");

    const userMessage = input.value;

    chatBox.innerHTML += `
      <div class="user">
        ${userMessage}
      </div>
    `;

    input.value = "";

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer YOUR_GROQ_API_KEY"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are CAVi, a professional Virtual CFO AI assistant."
            },
            {
              role: "user",
              content: userMessage
            }
          ]
        })
      }
    );

    const data = await response.json();

    const botReply =
      data.choices[0].message.content;

    chatBox.innerHTML += `
      <div class="bot">
        ${botReply}
      </div>
    `;
}