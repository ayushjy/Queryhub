# 🚀 QueryHub – AI Agent Chat App with RAG + Retriever Tool + Buffer Memory

**QueryHub** is a multi-turn AI conversational web app powered by **Retrieval-Augmented Generation (RAG)**, custom **LangChain agents**, and **vector search**. Admins can upload documents (PDF, DOCX, TXT), and users can query them via a smart AI agent chatbot.

---

## 🛠️ Built With

- 🧠 LangChain Agents + Retriever Tool  
- 📦 Pinecone for vector storage (embedding dim: `1536`)  
- 💬 OpenAI API (LLM + Embeddings)  
- 🧠 Redis for buffer memory  
- 🗂 MongoDB for persistent chat storage  
- ⚛️ React (Frontend) + Express.js (Backend)

---

## ✨ Features

- 🔐 JWT-based authentication (Admin & User roles)  
- 📁 Admin Dashboard: Upload and manage documents  
- 👤 User Dashboard: Chat with AI assistant  
- 🔄 Multi-turn memory using Redis Buffer Memory  
- 💾 Persistent chat history stored in MongoDB  
- 🔍 Agent-based RAG conversational responses  
- 📑 File support: PDF, DOC/DOCX, TXT

---

## ⚙️ Local Setup Instructions

### 1️⃣ Clone the Repository  

git clone https://github.com/ayushjy/Queryhub.git  
cd Queryhub

2️⃣ Backend Setup  
cd backend  
npm install  

Create a .env file inside /backend with the following:  
PORT=5000  
OPENAI_API_KEY=your_openai_api_key  
PINECONE_API_KEY=your_pinecone_api_key  
PINECONE_INDEX_NAME=your_index_name  
MONGODB_URI=your_mongodb_uri  
REDIS_URL=redis://localhost:6379  
JWT_SECRET=your_jwt_secret  
NODE_ENV=development  

3️⃣ Start Redis Server  
Make sure Redis is installed and running locally.

macOS/Linux:redis-server  
Windows: https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/install-redis-on-windows/

4️⃣ Frontend Setup  
cd ../frontend  
npm install  
npm start  

🧠 How It Works
Admin Uploads File
→ Stored → Parsed → Chunked → Embedded via text-embedding-3-small (OpenAI) → Stored in Pinecone.

User Asks Question
→ Chat history pulled from MongoDB + Redis
→ LangChain Agent uses retriever + tools
→ Queries Pinecone → Retrieves relevant context.

LLM Response
→ Agent constructs prompt using retrieved docs + memory + user input
→ Sends to OpenAI (GPT-4 / GPT-3.5)
→ Returns AI response.

Memory
→ Multi-turn conversation stored via RedisBufferMemory.

Persistence
→ Chat history saved in MongoDB
→ Shown again on page refresh.

## 🔐 API Keys Required

- 🔑 [OpenAI API Key](https://platform.openai.com/account/api-keys)
- 📦 [Pinecone API Key](https://app.pinecone.io/)
- 🍃 MongoDB URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- ⚡ Redis (local installation for development)

Make sure to create a Pinecone index with:
- Embedding model: `text-embedding-3-small`
- Dimensions: `1536`

🧑‍💻 Author  
Made with ❤️ by Ayush Jyoti
