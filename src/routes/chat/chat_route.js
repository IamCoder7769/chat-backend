import express from 'express';
import { firestore } from '../../services/firebase_admin.js';
import { chat } from '../../services/ai_chat.js';
import { Filter } from 'bad-words';

const chatRoute = express.Router();
const filter = new Filter();
const AI_BOT_ID = 'AI_FRIEND_BOT';

// POST /api/chat/send_message
chatRoute.post('/send_message', async (req, res) => {
    try {
        const { text, type = 'text', name, user, image, conversationId, recipientId, collectionName = 'conversation' } = req.body;

        let censoredText = text;
        try { censoredText = filter.clean(text); } catch (_) {}

        const conversationRef = firestore
            .collection('chat-hubb')
            .doc(collectionName)
            .collection(conversationId);

        await conversationRef.add({
            text: censoredText,
            type,
            name,
            user,
            image,
            conversationId,
            createdAt: new Date()
        });

        if (recipientId === AI_BOT_ID || (conversationId && conversationId.includes(AI_BOT_ID))) {
            try {
                const aiReply = await chat(user, censoredText);
                await conversationRef.add({
                    text: aiReply,
                    type: 'text',
                    name: 'AI Buddy',
                    user: AI_BOT_ID,
                    image: 'https://cdn-icons-png.flaticon.com/512/8943/8943377.png',
                    conversationId,
                    createdAt: new Date()
                });
            } catch (aiErr) {
                console.error('AI reply failed:', aiErr.message);
            }
        }

        res.json({ message: 'Message sent successfully', code: 200, data: { censored_text: censoredText } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default chatRoute;
