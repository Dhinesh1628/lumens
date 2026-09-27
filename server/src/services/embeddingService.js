import { pipeline } from '@xenova/transformers';
import { CONFIG } from '../config.js';

let extractorInstance = null;
let isInitializing = false;
let initPromise = null;

/**
 * Requirement 8: Pre-load Xenova embedding model during boot
 */
export async function initEmbeddingModel() {
  if (extractorInstance) return extractorInstance;
  if (isInitializing) return initPromise;

  isInitializing = true;
  console.log(`[Embeddings] Pre-loading model: ${CONFIG.EMBEDDING_MODEL}...`);
  
  initPromise = (async () => {
    try {
      // Load feature-extraction pipeline
      extractorInstance = await pipeline('feature-extraction', CONFIG.EMBEDDING_MODEL);
      console.log(`[Embeddings] Model ${CONFIG.EMBEDDING_MODEL} loaded successfully!`);
      
      // Quick sanity check test embedding to verify 384 dim safety
      const testVec = await generateEmbedding('Sanity check test string');
      if (testVec.length !== CONFIG.EMBEDDING_DIM) {
        throw new Error(`Embedding dimension mismatch! Expected ${CONFIG.EMBEDDING_DIM}, got ${testVec.length}`);
      }
      return extractorInstance;
    } catch (err) {
      console.error('[Embeddings] Failed to initialize embedding model:', err);
      extractorInstance = null;
      throw err;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

/**
 * Generate embedding vector for text
 * Requirement 1: Pin dimension safety (384)
 */
export async function generateEmbedding(text) {
  const extractor = await initEmbeddingModel();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  const vector = Array.from(output.data);

  if (vector.length !== CONFIG.EMBEDDING_DIM) {
    throw new Error(
      `Embedding vector length (${vector.length}) does not match required dimension (${CONFIG.EMBEDDING_DIM}).`
    );
  }

  return vector;
}
