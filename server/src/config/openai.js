let openai = null;

if (process.env.OPENAI_API_KEY) {
  try {
    const OpenAI = require("openai");
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log("[OpenAI] Client initialized successfully");
  } catch (err) {
    console.warn("[OpenAI] Failed to initialize:", err.message);
  }
} else {
  console.log("[OpenAI] No API key found — AI features will use fallbacks");
}

module.exports = openai;
