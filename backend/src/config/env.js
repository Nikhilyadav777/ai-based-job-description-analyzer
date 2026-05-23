import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,

  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
    baseUrl: (process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1").replace(
      /\/$/,
      ""
    ),
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  },
};

/* 🔥 DEBUG LOGS */
console.log("🚀 ENV LOADED");
console.log("🔑 GROQ KEY PRESENT:", Boolean(process.env.GROQ_API_KEY));
console.log("🤖 MODEL:", process.env.GROQ_MODEL);
console.log("🌐 BASE URL:", process.env.GROQ_BASE_URL);

/* CONFIG DEBUG */
console.log("🔥 FINAL GROQ CONFIG:", {
  hasKey: Boolean(config.groq.apiKey),
  model: config.groq.model,
  baseUrl: config.groq.baseUrl,
});

export function hasGroqKey() {
  const valid = Boolean(
    config.groq.apiKey &&
    config.groq.apiKey !== "your_groq_api_key_here"
  );

  /* 🔥 DEBUG FUNCTION LOG */
  console.log("🧪 hasGroqKey() =>", valid);

  return valid;
}