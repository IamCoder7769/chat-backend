import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import router from './routes/index.js';
import { connectDB } from './config/db.js';
import authRoute from './routes/auth/auth_route.js';
import cors from 'cors';
import roomRoute from './routes/room/room_route.js';
import chatRoute from './routes/chat/chat_route.js';
import { chat } from './services/ai_chat.js';

const app = express();

const allowedOrigins = [
    'http://localhost:5173', 
    'http://192.168.1.27:5173',
    'https://nexttalk-rust.vercel.app',
    'https://next-talk-frontend-alpha.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean).map(o => o.replace(/\/$/, ''));

const corsOptions = {
    origin: (origin, callback) => {
        const cleanOrigin = origin ? origin.replace(/\/$/, '') : null;
        if (!cleanOrigin || allowedOrigins.includes(cleanOrigin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', router);
app.use('/api/users', authRoute);
app.use('/api/users', roomRoute);
app.use('/api/chat', chatRoute);

app.post('/ai-chat', async (req, res) => {
    try {
        const { user_id, message } = req.body;
        const reply = await chat(user_id, message);
        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/ping', (req, res) => res.json({ message: 'pong' }));

connectDB().catch(err => console.error('MongoDB connection error:', err));

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

export default app;
