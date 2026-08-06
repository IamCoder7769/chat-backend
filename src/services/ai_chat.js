import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRelevantMemory } from './memory_retrieve.js';
import { storeMemory } from './memory_store.js';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function chat(userId, message) {
    const memories = await getRelevantMemory(userId, message);
    const memoryText = memories.join('\n');

    const prompt = `You are a friendly AI chatbot.

User previous memory:
${memoryText}

Current message:
${message}

Answer naturally and remember user context.`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    await storeMemory(userId, `User: ${message}`);
    await storeMemory(userId, `Bot: ${reply}`);

    return reply;
}
