# QueryHub – AI Agent Chat App with RAG + Buffer Memory

QueryHub is a multi-turn AI conversational web app using Retrieval-Augmented Generation (RAG), custom LangChain agents, and vector search. Admins can upload documents (PDF, DOCX, TXT), and users can query them through a smart AI chatbot powered by OpenAI and Pinecone.

Built with:  
- 🧠 LangChain Agents + Retriever Tool  
- 📦 Pinecone for vector storage (embedding dim: 1536)  
- 💬 OpenAI API (LLM + Embeddings)  
- 🧠 Redis for buffer memory  
- 🗂 MongoDB for chat storage  
- 🧑‍💻 React + Express.js

---

## ✨ Features

- Admin Dashboard: Upload and manage documents  
- User Dashboard: Chat with AI assistant on uploaded docs  
- Multi-turn memory using Redis buffer memory  
- MongoDB chat storage (state preserved on page refresh)  
- RAG + Agent-based conversational responses  
- JWT-based authentication (Admin & User roles)  
- File support: PDF, DOC/DOCX, TXT

---

## 🚀 Running Locally

### 1. Clone the repo
git clone https://github.com/yourusername/queryhub.git
cd queryhub

2. Setup Backend
cd backend
npm install

🔑 Create a .env file inside /backend:PORT=5000
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
MONGODB_URI=your_mongodb_uri
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
NODE_ENV=development


3. Start Redis Server
Make sure Redis is installed and running locally.
On macOS/Linux:redis-server
On Windows:
Install Redis for Windows from: https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/install-redis-on-windows/

4. Setup Frontend
cd ../frontend
npm install
npm start


📌 4. How It Works (Architecture Summary)
## 🧠 How It Works

1. Admin uploads files → Stored → Parsed → Chunked → Embedded using `text-embedding-3-small` (OpenAI) → Stored in Pinecone
2. User asks a question → Chat history fetched from MongoDB + Redis → LangChain Agent uses retriever + tools → Query Pinecone → Fetch context
3. Agent constructs prompt with retrieved docs + memory → Sends to OpenAI LLM (GPT-4 / GPT-3.5) → Returns response
4. Multi-turn memory is stored in RedisBufferMemory (custom retriever)
5. All chats stored in MongoDB → Shown on page refresh


🔐 5. API Keys Required
## 🔐 API Keys Required

- 🔑 [OpenAI API Key](https://platform.openai.com/account/api-keys)
- 📦 [Pinecone API Key](https://app.pinecone.io/)
- 🍃 MongoDB URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- ⚡ Redis (local installation for development)

Make sure to create a Pinecone index with:
- Embedding model: `text-embedding-3-small`
- Dimensions: `1536`
