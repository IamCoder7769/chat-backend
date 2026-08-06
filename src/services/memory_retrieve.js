import { getPineconeIndex } from './vector_db.js';
import { getEmbedding } from './embeddings.js';

export async function getRelevantMemory(userId, query, topK = 5) {
    const index = await getPineconeIndex();
    const vector = await getEmbedding(query);
    const results = await index.query({
        vector,
        topK,
        includeMetadata: true,
        filter: { user_id: userId }
    });
    return results.matches.map(m => m.metadata.text);
}
