import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    "WARNING: OPENAI_API_KEY is not set. AI-powered endpoints will fail until it's configured."
  );
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});