import 'dotenv/config';

async function testGroq() {
  try {
    const apiKey = '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';

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing in .env file");
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: "Say hello in one line",
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    console.log("✅ Groq API is working!");
    console.log("Response:", data.choices[0].message.content);

  } catch (error) {
    console.error("❌ Groq test failed:");
    console.error(error.message || error);
  }
}

testGroq();