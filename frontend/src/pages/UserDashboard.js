import React, { useState, useEffect, useRef } from 'react';

export default function UserDashboard({ user, setUser }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  // 👉 Generate new sessionId (UUID-like using Date and random string)
  const generateSessionId = () => {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  };

  // ✅ Ensure sessionId exists in localStorage
  useEffect(() => {
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', generateSessionId());
    }
    fetchChatHistory();
  }, []);

  // 🔁 Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // 🔁 Fetch chat history from MongoDB using sessionId
  const fetchChatHistory = async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return;

    try {
      const res = await fetch(`https://queryhub-kij8.onrender.com/api/chat/history/${sessionId}?userId=${user._id}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      setChatHistory(data);
    } catch (err) {
      console.error('❌ Error fetching chat history:', err);
    }
  };

  // 🚀 Ask question to the agent
  const handleAsk = async () => {
    if (!question.trim()) return;

    const sessionId = localStorage.getItem('sessionId');
    setLoading(true);
    setAnswer('');
    try {
      const res = await fetch('https://queryhub-kij8.onrender.com/api/chat/agent', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, sessionId, userId: user._id }),
      });

      const data = await res.json();
      setAnswer(data.answer);
      setQuestion('');

      // 🧠 Update chat history after new message
      setChatHistory((prev) => [
        ...prev,
        { role: 'user', content: question },
        { role: 'agent', content: data.answer },
      ]);
    } catch (err) {
      setAnswer('❌ Error getting response from the agent.');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Start a new chat (reset session)
  const handleNewChat = async () => {
    const oldSessionId = localStorage.getItem('sessionId');
    if (oldSessionId) {
      await fetch('https://queryhub-kij8.onrender.com/api/chat/clear-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId: oldSessionId }),
      });
    }
    const newSessionId = generateSessionId();
    localStorage.setItem('sessionId', newSessionId);
    setChatHistory([]);
    setAnswer('');
    setQuestion('');
  };

  // 🔐 Logout handler
  const handleLogout = async () => {
    await fetch('https://queryhub-kij8.onrender.com/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gray-800">
        <h1 className="text-2xl font-bold tracking-wide hover:text-teal-400 cursor-pointer transition duration-300">
          QUERYHUB
        </h1>
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-full hover:bg-gray-600 transition duration-300"
          >
            <span className="capitalize">{user.username}</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${profileOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4 z-10">
              <p className="text-sm text-gray-300 mb-3">
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition duration-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold hover:text-teal-300 transition duration-300">
            Ask the Agent
          </h2>
          <button
            onClick={handleNewChat}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm rounded-lg font-medium"
          >
            + New Chat
          </button>
        </div>

        {/* Ask input */}
        <textarea
          rows={4}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-teal-400 focus:outline-none resize-none"
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        ></textarea>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleAsk}
            disabled={loading}
            className="bg-teal-500 hover:bg-teal-400 px-6 py-2 rounded-lg text-white font-semibold transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>

        {/* 💬 Chat Messages */}
        <div className="space-y-4 mb-6 mt-6">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm text-sm ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-700 text-gray-100 rounded-bl-none'
                  }`}
              >
                <span className="block mb-1 text-xs font-medium opacity-80">
                  {msg.role === 'user' ? 'You' : 'Agent'}
                </span>
                <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </main>
    </div>
  );
}
