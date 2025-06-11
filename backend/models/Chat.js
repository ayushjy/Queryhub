// backend/models/Chat.js
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['user', 'agent'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Chat', chatSchema);
