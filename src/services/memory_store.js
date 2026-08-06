import { getPineconeIndex } from './vector_db.js';
import { getEmbedding } from './embeddings.js';
import { v4 as uuidv4 } from 'uuid';

export async function storeMemory(userId, text) {
    const index = await getPineconeIndex();
    const vector = await getEmbedding(text);
    await index.upsert([{
        id: uuidv4(),
        values: vector,
        metadata: { user_id: userId, text }
    }]);
}
