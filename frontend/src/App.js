import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 1. Check auth on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('https://queryhub-ccsl.onrender.com/api/auth/me', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    // 2. Navigate after user is set and loading is done
    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'user') {
                navigate('/user');
            }
        }
    }, [user, loading, navigate]);

    if (loading) return <div>Loading...</div>;

    return (
        
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/admin" element={
                    user && user.role === 'admin'
                        ? <AdminDashboard user={user} setUser={setUser}/>
                        : <Navigate to="/login" />
                } />
                <Route path="/user" element={
                    user && user.role === 'user'
                        ? <UserDashboard user={user} setUser={setUser}/>
                        : <Navigate to="/login" />
                } />
            </Routes>
    );
}

export default App;