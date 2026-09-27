import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '*',
  
  // Requirement 1: Embedding Dimension Safety
  EMBEDDING_MODEL: 'Xenova/all-MiniLM-L6-v2',
  EMBEDDING_DIM: 384,

  // Requirement 3: Token-Accurate Chunking
  TARGET_CHUNK_TOKENS: 500,
  CHUNK_OVERLAP_TOKENS: 50,

  // Requirement 4: Re-ranking & Deduplication
  RETRIEVAL_TOP_K: 8,
  FINAL_TOP_K: 4,
  JACCARD_SIMILARITY_THRESHOLD: 0.55,

  // Requirement 5: Collection TTL & Hard Cap
  COLLECTION_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
  MAX_COLLECTIONS: 50,
  CLEANUP_INTERVAL_MS: 60 * 60 * 1000, // 1 hour

  // Requirement 6: Multer Upload Validation
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ['application/pdf', 'text/plain'],

  // LLM Configurations
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini', // 'gemini', 'openai', or 'groq'
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || process.env.LLM_API_KEY || '',
  CHROMA_URL: process.env.CHROMA_URL || 'http://localhost:8000'
};
