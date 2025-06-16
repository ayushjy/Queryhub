import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://queryhub-kij8.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md space-y-4"
      >
        {/* Logo */}
        <div
          className="text-3xl font-bold mb-6 text-center cursor-pointer hover:text-indigo-400 transition"
          onClick={() => navigate('/')}
        >
          QueryHub
        </div>

        <h2 className="text-2xl font-bold text-center">Register</h2>

        {error && <p className="text-red-500">{error}</p>}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="w-full py-2 bg-green-600 rounded hover:bg-green-500 transition"
        >
          Register
        </button>

        {/* Link to Login */}
        <p className="text-gray-400 text-sm mt-4 text-center">
          Already a user?{' '}
          <span
            onClick={() => navigate('/login')}
            className="underline cursor-pointer text-indigo-400 hover:text-indigo-300"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;