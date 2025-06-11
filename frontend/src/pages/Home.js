import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
      {/* Logo or title */}
      <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-pulse">
        Welcome to QueryHub
      </h1>

      {/* Subtext */}
      <p className="text-lg md:text-2xl mb-8 text-gray-400 text-center max-w-xl">
        Your smart assistant for document search, powered by Langchain and advanced vector search.
      </p>

      {/* Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => navigate('/register')}
          className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition transform hover:scale-105"
        >
          Register
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-pink-600 rounded-lg hover:bg-pink-500 transition transform hover:scale-105"
        >
          Login
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-gray-500 text-sm">
        © 2025 QueryHub — Built with 💻 and ☕
      </footer>
    </div>
  );
};

export default Home;
