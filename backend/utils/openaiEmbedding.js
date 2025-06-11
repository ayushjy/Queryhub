import { OpenAIEmbeddings } from "@langchain/openai";

// Use "text-embedding-3-large" for best quality, or "text-embedding-3-small" for speed/cost.
const openaiEmbedding = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small", //"text-embedding-3-small"
});

export default openaiEmbedding;