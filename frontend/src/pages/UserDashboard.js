import React, { useState, useEffect } from 'react';

export default function UserDashboard({ user, setUser }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

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
  const handleNewChat = () => {
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

        {/* Chat history */}
        <div className="space-y-4 mb-6">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-gray-800 text-right border border-gray-600'
                  : 'bg-teal-900 border border-teal-700 text-left'
              }`}
            >
              <span className="block text-sm font-bold mb-1">
                {msg.role === 'user' ? 'You' : 'Agent'}
              </span>
              <p className="whitespace-pre-line">{msg.content}</p>
            </div>
          ))}
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

        {/* Latest answer */}
        {/* {answer && (
          <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-6 transition-all duration-300">
            <h3 className="text-lg font-semibold text-teal-400 mb-2">Agent's Response:</h3>
            <p className="whitespace-pre-line text-gray-200">{answer}</p>
          </div>
        )} */}
      </main>
    </div>
  );
}
