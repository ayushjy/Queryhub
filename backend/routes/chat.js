import express from 'express';
import { askAgent, getChatHistory } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js'; // if auth is used

const router = express.Router();

router.post('/agent', protect, askAgent);
router.get('/history/:sessionId', getChatHistory);

export default router;
