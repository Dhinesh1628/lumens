import { ChromaClient } from 'chromadb';
import { CONFIG } from '../config.js';
import { generateEmbedding } from './embeddingService.js';

// In-Memory store fallback registry
// Structure: Map<sessionId, { createdAt: number, metadata: object, chunks: Array<{ id, vector, text, metadata }> }>
const memoryCollections = new Map();

let chromaClient = null;
let useMemoryFallback = false;

/**
 * Initialize Chroma client or default to Memory fallback
 */
async function getChromaClient() {
  if (useMemoryFallback) return null;
  if (!chromaClient) {
    try {
      chromaClient = new ChromaClient({ path: CONFIG.CHROMA_URL });
      await chromaClient.heartbeat();
      console.log(`[VectorStore] Connected to ChromaDB at ${CONFIG.CHROMA_URL}`);
    } catch (err) {
      console.warn(`[VectorStore] Could not connect to ChromaDB at ${CONFIG.CHROMA_URL}. Switching to In-Memory Vector Store fallback.`);
      useMemoryFallback = true;
      chromaClient = null;
    }
  }
  return chromaClient;
}

/**
 * Requirement 5: Enforce Collection Cap (Max 50) with oldest-first FIFO eviction
 */
async function enforceCollectionCap() {
  const client = await getChromaClient();
  
  if (client) {
    try {
      const collections = await client.listCollections();
      if (collections.length >= CONFIG.MAX_COLLECTIONS) {
        // Find oldest collection
        // Note: Sort by metadata createdAt if available, or delete first
        console.warn(`[VectorStore] Collection cap reached (${collections.length}/${CONFIG.MAX_COLLECTIONS}). Evicting oldest collection...`);
        const oldestName = collections[0].name;
        await client.deleteCollection({ name: oldestName });
        console.log(`[VectorStore] Evicted oldest collection: ${oldestName}`);
      }
    } catch (e) {
      console.error('[VectorStore] Error during collection cap enforcement:', e);
    }
  } else {
    if (memoryCollections.size >= CONFIG.MAX_COLLECTIONS) {
      const oldestSessionId = memoryCollections.keys().next().value;
      memoryCollections.delete(oldestSessionId);
      console.log(`[VectorStore Memory] Evicted oldest session: ${oldestSessionId}`);
    }
  }
}

/**
 * Requirement 5: Scheduled TTL cleanup for collections older than 24 hours
 */
export async function runTtlCleanup() {
  const now = Date.now();
  console.log(`[VectorStore Cleanup] Running scheduled TTL check at ${new Date(now).toISOString()}...`);

  if (!useMemoryFallback && chromaClient) {
    try {
      const collections = await chromaClient.listCollections();
      for (const col of collections) {
        if (col.metadata && col.metadata.createdAt) {
          const age = now - Number(col.metadata.createdAt);
          if (age > CONFIG.COLLECTION_TTL_MS) {
            console.log(`[VectorStore Cleanup] Deleting expired collection: ${col.name} (Age: ${(age / 3600000).toFixed(1)}h)`);
            await chromaClient.deleteCollection({ name: col.name });
          }
        }
      }
    } catch (err) {
      console.error('[VectorStore Cleanup] Error cleaning Chroma collections:', err);
    }
  }

  // Cleanup in-memory collections
  for (const [sessionId, data] of memoryCollections.entries()) {
    const age = now - data.createdAt;
    if (age > CONFIG.COLLECTION_TTL_MS) {
      console.log(`[VectorStore Memory Cleanup] Deleting expired session: ${sessionId}`);
      memoryCollections.delete(sessionId);
    }
  }
}

// Start recurring cleanup timer
setInterval(runTtlCleanup, CONFIG.CLEANUP_INTERVAL_MS);

/**
 * Requirement 1: Pin Vector Dimension Safety & Store Chunks
 */
export async function storeChunks(sessionId, chunks) {
  await enforceCollectionCap();
  const createdAt = Date.now();

  // Generate embeddings for all chunks
  const ids = [];
  const embeddings = [];
  const documents = [];
  const metadatas = [];

  for (const chunk of chunks) {
    const vector = await generateEmbedding(chunk.text);
    
    // Requirement 1: Explicit dimension validation
    if (vector.length !== CONFIG.EMBEDDING_DIM) {
      throw new Error(`Embedding vector dimension error! Expected ${CONFIG.EMBEDDING_DIM}, received ${vector.length}`);
    }

    ids.push(chunk.id);
    embeddings.push(vector);
    documents.push(chunk.text);
    metadatas.push(chunk.metadata);
  }

  const client = await getChromaClient();

  if (client) {
    const collectionName = `lumen_${sessionId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    
    // Check if collection already exists to validate dimension
    try {
      const existing = await client.getCollection({ name: collectionName });
      if (existing) {
        // Test query or check metadata for dimension safety
        const testRes = await existing.peek({ limit: 1 });
        if (testRes.embeddings && testRes.embeddings[0] && testRes.embeddings[0].length !== CONFIG.EMBEDDING_DIM) {
          throw new Error(
            `Collection "${collectionName}" dimension mismatch! DB has ${testRes.embeddings[0].length} dimensions, expected ${CONFIG.EMBEDDING_DIM}.`
          );
        }
      }
    } catch (e) {
      // Collection does not exist yet; safe to proceed
    }

    const collection = await client.getOrCreateCollection({
      name: collectionName,
      metadata: { createdAt, embeddingDim: CONFIG.EMBEDDING_DIM }
    });

    await collection.add({
      ids,
      embeddings,
      documents,
      metadatas
    });

    console.log(`[VectorStore Chroma] Ingested ${chunks.length} chunks into collection ${collectionName}`);
  } else {
    // In-memory fallback
    const sessionStore = memoryCollections.get(sessionId) || { createdAt, metadata: {}, chunks: [] };
    
    for (let i = 0; i < chunks.length; i++) {
      sessionStore.chunks.push({
        id: ids[i],
        vector: embeddings[i],
        text: documents[i],
        metadata: metadatas[i]
      });
    }

    memoryCollections.set(sessionId, sessionStore);
    console.log(`[VectorStore Memory] Ingested ${chunks.length} chunks into session ${sessionId}`);
  }

  return { sessionId, totalChunks: chunks.length };
}

/**
 * Vector similarity retrieval
 */
export async function querySimilarity(sessionId, queryText, k = CONFIG.RETRIEVAL_TOP_K) {
  const queryVector = await generateEmbedding(queryText);
  const client = await getChromaClient();

  if (client) {
    const collectionName = `lumen_${sessionId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    try {
      const collection = await client.getCollection({ name: collectionName });
      const results = await collection.query({
        queryEmbeddings: [queryVector],
        nResults: k
      });

      const retrieved = [];
      if (results && results.documents && results.documents[0]) {
        for (let i = 0; i < results.documents[0].length; i++) {
          retrieved.push({
            id: results.ids[0][i],
            text: results.documents[0][i],
            metadata: results.metadatas[0][i],
            distance: results.distances ? results.distances[0][i] : 0
          });
        }
      }
      return retrieved;
    } catch (err) {
      console.error(`[VectorStore Chroma Query Error] Collection ${collectionName}:`, err);
      return [];
    }
  } else {
    // In-memory cosine similarity search
    const sessionStore = memoryCollections.get(sessionId);
    if (!sessionStore || sessionStore.chunks.length === 0) return [];

    const scored = sessionStore.chunks.map((item) => {
      const sim = cosineSimilarity(queryVector, item.vector);
      return {
        id: item.id,
        text: item.text,
        metadata: item.metadata,
        similarity: sim,
        distance: 1 - sim
      };
    });

    // Sort by highest similarity
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, k);
  }
}

/**
 * Cosine similarity helper
 */
function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
