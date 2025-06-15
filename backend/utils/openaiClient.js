import { ChatOpenAI } from "@langchain/openai";

const openaiClient = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY, // Set this in your .env
  modelName: "gpt-4o", // or "gpt-4-turbo", "gpt-3.5-turbo", etc.
  temperature: 0.2,
    systemMessage: "Only answer using the information provided from the documents. If unsure, say you don't know.",
  maxTokens: 2048,
});

export default openaiClient;