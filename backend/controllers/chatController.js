import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { PineconeStore } from '@langchain/community/vectorstores/pinecone';
import { createRetrieverTool } from 'langchain/tools/retriever';
import { RedisChatMessageHistory } from '@langchain/community/stores/message/ioredis';
import { BufferMemory } from 'langchain/memory';

import openaiEmbedding from '../utils/openaiEmbedding.js';
import openaiClient from '../utils/openaiClient.js';
import pineconeIndex from '../utils/pineconeClient.js';

import Chat from '../models/Chat.js';
import Redis from 'ioredis';

import dotenv from 'dotenv';
dotenv.config();

// Initialize Redis
const redisClient = new Redis(process.env.REDIS_URL);

// ========================================
// Ask Agent Controller
// ========================================
export const askAgent = async (req, res) => {
  const { question, sessionId, userId } = req.body;

  // 🔐 Validate input
  if (!question || !sessionId || !userId) {
    return res.status(400).json({ message: 'Question, sessionId, and userId are required' });
  }

  try {
    // 1️⃣ Load existing vector store from Pinecone
    const vectorStore = await PineconeStore.fromExistingIndex(openaiEmbedding, {
      pineconeIndex,
    });

    // 2️⃣ Create retriever from vector store with top-k results
    const retriever = vectorStore.asRetriever({ k: 3 });

    // 3️⃣ Manually get relevant docs BEFORE calling agent
    const relevantDocs = await retriever.getRelevantDocuments(question);

    // 4️⃣ If nothing matched in Pinecone, exit early (no agent call)
    if (relevantDocs.length === 0) {
      const fallback = "❌ Sorry, I couldn’t find anything related in your uploaded documents.";

      // Save both user and agent message in MongoDB
      await Chat.create([
        { sessionId, userId, role: 'user', content: question },
        { sessionId, userId, role: 'agent', content: fallback }
      ]);

      return res.json({ answer: fallback });
    }

    // 🧠 Optional: Log retrieved chunks (for debugging)
    // relevantDocs.forEach((doc, i) => console.log(`Chunk ${i + 1}:`, doc.pageContent));

    // 5️⃣ Create retriever tool (used by the agent)
    const retrieverTool = await createRetrieverTool(retriever, {
      name: 'pinecone_search',
      description: 'Use this tool to answer questions based only on uploaded documents.',
    });

    // 6️⃣ Initialize Redis-based chat memory
    const messageHistory = new RedisChatMessageHistory({
      sessionId,
      client: redisClient,
      sessionTTL: 60 * 60 * 24, // 1 day
    });

    const memory = new BufferMemory({
      memoryKey: 'chat_history',
      returnMessages: true,
      inputKey: 'input',
      outputKey: 'output',
      chatHistory: messageHistory,
      llm: openaiClient,
    });

    // 7️⃣ Initialize Agent with retriever tool + memory
    const executor = await initializeAgentExecutorWithOptions(
      [retrieverTool],        // tools
      openaiClient,           // model
      {
        agentType: 'openai-functions',
        verbose: true,
        memory,
      }
    );

    console.log(`[Agent] Running for session: ${sessionId} - Question: ${question}`);

    // 8️⃣ Ask the agent with user question
    const result = await executor.run({ content: question });

    // 9️⃣ Save question and answer in MongoDB for frontend chat display
    await Chat.create([
      { sessionId, userId, role: 'user', content: question },
      { sessionId, userId, role: 'agent', content: result }
    ]);

    // 🔟 Send agent response back
    res.json({ answer: result });

  } catch (err) {
    console.error('[Agent Error]', err);
    res.status(500).json({ message: 'Agent error', error: err.message });
  }
};

// ========================================
// Get Chat History Controller
// ========================================
export const getChatHistory = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user?._id || req.query.userId; // from auth or fallback

  try {
    const chats = await Chat.find({ sessionId, userId }).sort({ timestamp: 1 });
    res.json(chats);
  } catch (err) {
    console.error('[Chat History Error]', err);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
};

export const clearSessionMemory = async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

  try {
    const messageHistory = new RedisChatMessageHistory({
      sessionId,
      client: redisClient,
    });
    await messageHistory.clear();
    res.json({ message: 'Session memory cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear session memory' });
  }
};