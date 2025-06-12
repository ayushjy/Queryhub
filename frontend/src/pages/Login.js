import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('https://queryhub-ccsl.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 🟢 include cookies
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      const meRes = await fetch('https://queryhub-ccsl.onrender.com/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      const meData = await meRes.json();
      setUser(meData); // <-- Set user state here

      // if (data.role === 'admin') {
      //   navigate('/admin');
      // } else {
      //   navigate('/user');
      // }
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <form className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl text-white mb-6 text-center">Login</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="w-full p-3 bg-pink-600 rounded hover:bg-pink-500 transition">
          Login
        </button>

        <p className="text-gray-400 text-sm mt-4 text-center">
          Don't have an account? <span onClick={() => navigate('/register')} className="underline cursor-pointer">Register</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
