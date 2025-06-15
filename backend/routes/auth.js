import express from 'express';
import { register, login } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, (req, res) => {
    res.json(req.user);
});
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true, // Set to true in production',
        sameSite: 'none',
        path: '/', // required to match the default set path
    });
    res.json({ message: 'Logged out successfully' });
});
export default router;
