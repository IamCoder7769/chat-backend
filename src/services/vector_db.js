import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'chat-hubb-memory';

let index;

export async function getPineconeIndex() {
    if (index) return index;

    const existingIndexes = await pc.listIndexes();
    const names = existingIndexes.indexes?.map(i => i.name) || [];

    if (!names.includes(INDEX_NAME)) {
        await pc.createIndex({
            name: INDEX_NAME,
            dimension: 768,
            metric: 'cosine',
            spec: { serverless: { cloud: 'aws', region: 'us-east-1' } }
        });
    }

    index = pc.index(INDEX_NAME);
    return index;
}
