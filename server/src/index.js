import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { CONFIG } from './config.js';
import { initEmbeddingModel } from './services/embeddingService.js';
import { extractPdfPages, extractTxtPages } from './utils/pdfParser.js';
import { chunkPages } from './utils/chunker.js';
import { storeChunks } from './services/vectorStoreService.js';
import { answerQuestion } from './services/ragService.js';

const app = express();

// Requirement 7: CORS setup with origin configuration
app.use(cors({
  origin: CONFIG.CLIENT_ORIGIN,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Requirement 6: Upload Validation at Multer Layer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: CONFIG.MAX_FILE_SIZE_BYTES // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error(`Unsupported file type: ${file.mimetype}. Only PDF and TXT files are allowed.`);
      err.status = 400;
      cb(err, false);
    }
  }
});

// Requirement 7: Warm-up / Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    embeddingModel: CONFIG.EMBEDDING_MODEL,
    embeddingDim: CONFIG.EMBEDDING_DIM,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/upload
 * Ingest document (PDF or TXT)
 */
app.post('/api/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: `File too large. Maximum size allowed is 10MB.` });
      }
      return res.status(err.status || 400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const sessionId = req.body.sessionId || `session_${Date.now()}`;
    const filename = req.file.originalname;
    const mimeType = req.file.mimetype;

    console.log(`[Upload API] Processing file: ${filename} (${mimeType}) for Session: ${sessionId}`);

    // Parse per-page text (Requirement 2)
    let pages = [];
    if (mimeType === 'application/pdf') {
      pages = await extractPdfPages(req.file.buffer);
    } else {
      pages = extractTxtPages(req.file.buffer);
    }

    if (pages.length === 0 || pages.every(p => !p.text.trim())) {
      return res.status(400).json({ error: 'File contains no readable text content.' });
    }

    // Token-accurate chunking (Requirement 3)
    const chunks = chunkPages(pages, filename);

    if (chunks.length === 0) {
      return res.status(400).json({ error: 'Failed to generate readable chunks from file.' });
    }

    // Embed & Store in Vector DB (Requirement 1 & 5)
    await storeChunks(sessionId, chunks);

    return res.status(200).json({
      success: true,
      sessionId,
      filename,
      pageCount: pages.length,
      chunkCount: chunks.length
    });
  } catch (err) {
    console.error('[Upload API Error]', err);
    return res.status(500).json({ error: err.message || 'Internal server error during document processing.' });
  }
});

/**
 * POST /api/query
 * Execute RAG Query
 */
app.post('/api/query', async (req, res) => {
  try {
    const { sessionId, question } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Query question cannot be empty.' });
    }

    console.log(`[Query API] Session: ${sessionId} | Question: "${question}"`);

    const result = await answerQuestion(sessionId, question);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[Query API Error]', err);
    return res.status(500).json({ error: err.message || 'Internal server error during query processing.' });
  }
});

// Custom Error Handler
app.use((err, req, res, next) => {
  console.error('[Express Error]', err);
  res.status(err.status || 500).json({ error: err.message || 'An unexpected server error occurred.' });
});

// Requirement 8: Pre-load embedding model on boot before starting server listener
async function startServer() {
  try {
    await initEmbeddingModel();
    app.listen(CONFIG.PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 Lumen Server is running on port ${CONFIG.PORT}`);
      console.log(`📍 Health Check: http://localhost:${CONFIG.PORT}/health`);
      console.log(`==================================================\n`);
    });
  } catch (err) {
    console.error('Failed to start server due to initialization error:', err);
    process.exit(1);
  }
}

startServer();
