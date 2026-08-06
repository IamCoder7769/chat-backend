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
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.1.27:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (mobile apps, curl, etc)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests for all routes
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', router);
app.use('/api/users', authRoute);
app.use('/api/users', roomRoute);
app.use('/api/chat', chatRoute);

// AI chat endpoint (used by FloatingAIBot)
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

(async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
})();
