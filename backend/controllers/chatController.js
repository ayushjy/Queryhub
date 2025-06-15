import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { Calculator } from '@langchain/community/tools/calculator';
import { PineconeStore } from '@langchain/community/vectorstores/pinecone';
import { createRetrieverTool } from 'langchain/tools/retriever';
import { RedisChatMessageHistory } from "@langchain/community/stores/message/ioredis";
import { BufferMemory } from 'langchain/memory';
import openaiEmbedding from '../utils/openaiEmbedding.js';
import openaiClient from '../utils/openaiClient.js';
import pineconeIndex from '../utils/pineconeClient.js';

import Chat from '../models/Chat.js';
import Redis from 'ioredis';

import dotenv from 'dotenv';
dotenv.config();

// Initialize Redis client
const redisClient = new Redis(process.env.REDIS_URL);

export const askAgent = async (req, res) => {
  const { question, sessionId, userId } = req.body;

  if (!question || !sessionId || !userId) {
    return res.status(400).json({ message: 'Question, sessionId, and userId are required' });
  }

  try {
    // 1. Load vector store from Pinecone index
    const vectorStore = await PineconeStore.fromExistingIndex(openaiEmbedding, {
      pineconeIndex,
    });

    const retriever = vectorStore.asRetriever({ k: 3 });

    // 2. Create retriever tool for the agent
    const retrieverTool = await createRetrieverTool(retriever, {
      name: 'pinecone_search',
      description: 'Useful for searching documents stored in Pinecone',
    });

    // 3. Add Calculator tool (optional)
    // const calculator = new Calculator();

    // 4. Setup RedisChatMessageHistory for the session
    const messageHistory = new RedisChatMessageHistory({
      sessionId: sessionId,
      client: redisClient,
      sessionTTL: 60 * 60 * 24, // 1 day expiry
    });

    // 5. Setup SummaryMemory
    const memory = new BufferMemory({
      memoryKey: 'chat_history',
      returnMessages: true,
      inputKey: 'input',
      outputKey: 'output',
      chatHistory: messageHistory,
      llm: openaiClient,
    });

    // 6. Initialize LangChain Agent with tools + memory
    const executor = await initializeAgentExecutorWithOptions(
      [retrieverTool],
      openaiClient,
      {
        agentType: 'openai-functions',
        verbose: true,
        memory,
      }
    );

    console.log(`[Agent] Running for session: ${sessionId} - Question: ${question}`);

    // 7. Run the agent with user input
    const result = await executor.run({ content: question });

    // 8. Store question + answer in MongoDB for frontend display
    await Chat.create([
      { sessionId, userId, role: 'user', content: question },
      { sessionId, userId, role: 'agent', content: result }
    ]);

    // 9. Send response back to frontend
    res.json({ answer: result });

  } catch (err) {
    console.error('[Agent Error]', err);
    res.status(500).json({ message: 'Agent error', error: err.message });
  }
};

export const getChatHistory = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user?._id || req.query.userId; // or get from JWT/session

  try {
    const chats = await Chat.find({ sessionId, userId }).sort({ timestamp: 1 });
    res.json(chats);
  } catch (err) {
    console.error('[Chat History Error]', err);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
};
