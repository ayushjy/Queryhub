# QueryHub – AI Agent Chat App with RAG + Buffer Menory

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

```bash
git clone https://github.com/yourusername/queryhub.git
cd queryhub
