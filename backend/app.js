import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';

const app = express();

// Middleware
app.use(cors({
    origin: 'https://queryhub-virid.vercel.app/', // frontend URL
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'QueryHub backend is running!' });
});

export default app;
