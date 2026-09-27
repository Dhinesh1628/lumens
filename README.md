# Lumen — Grounded Full-Stack RAG Document Q&A

**Lumen** is a full-stack Retrieval-Augmented Generation (RAG) document Q&A application designed for portfolio and technical interview walkthroughs. It allows users to upload PDF and TXT documents, automatically parses per-page text, generates token-accurate chunks, stores embeddings locally, and executes grounded natural-language Q&A with explicit source citations.

---

## Architecture Diagram

```
 +------------------------+              +--------------------------+
 |   React + Vite Client  |  POST /upload|    Express API Server    |
 |   Tailwind CSS UI      | -----------> |    (Node.js / ESM)        |
 +------------------------+              +--------------------------+
      |               ^                              |
      |               | JSON                         | Per-Page Text Extraction
      | POST /query   | Response                     v
      v               |                  +--------------------------+
 +------------------------+              | pdf-parse (pagerender) / |
 | Grounded Q&A Thread    |              | Plain text parser        |
 | - Citation Cards       |              +--------------------------+
 | - Grounded Alerts      |                          |
 +------------------------+                          | Token-Accurate Split
                                                     v
 +------------------------+              +--------------------------+
 | Xenova Embeddings      | <----------- | js-tiktoken Chunker      |
 | (all-MiniLM-L6-v2)     |  384-dim     | (~500 tokens, 50 overlap)|
 +------------------------+  Vectors     +--------------------------+
             |                                       |
             v                                       v
 +------------------------+              +--------------------------+
 | ChromaDB Vector DB     | <----------- | Jaccard Deduplication    |
 | (or Memory Fallback)   |  Top-8 Query | & Diversity Re-ranking   |
 +------------------------+              +--------------------------+
                                                     |
                                                     | Grounded Prompt + Context
                                                     v
                                         +--------------------------+
                                         | LLM (Gemini / Groq /     |
                                         |      OpenAI API)         |
                                         +--------------------------+
```

---

## Key Technical Highlights

1. **Embedding Dimension Safety**
   - Centralized configuration (`CONFIG.EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2'`, `CONFIG.EMBEDDING_DIM = 384`).
   - Dimension validation checks during store initialization to prevent mismatched dimension corruption.
2. **Page-Accurate PDF Tracking**
   - Uses `pdf-parse` custom `pagerender` callback to extract text page-by-page.
   - Every chunk retains metadata (`{ filename, pageNumber, chunkIndex, tokenCount }`).
3. **Token-Accurate Chunking**
   - Powered by `js-tiktoken` (`cl100k_base` tokenizer) for exact token boundaries (~500 tokens per chunk, 50 overlap).
4. **Deduplication & Diversity Re-Ranking**
   - Retrieves top $k=8$ similarity candidates.
   - Deduplicates near-duplicate chunks using Jaccard text similarity ($>0.55$).
   - Re-ranks deduplicated candidates to prioritize source location and page diversity down to top-4 chunks.
5. **Collection TTL & Hard Cap**
   - 24-hour collection expiration TTL with periodic background cleanup timers.
   - Hard cap of 50 active collections with FIFO eviction when exceeded.
6. **Multer Layer Upload Validation**
   - Multer middleware configured with 10MB limit and MIME whitelist (`application/pdf`, `text/plain`), failing fast with HTTP 400 before parsing.
7. **Cold-Start UX & Health Warm-Up**
   - Server pre-loads embedding models on startup.
   - `GET /health` endpoint with frontend polling and visible "Waking up server..." status banner for free-tier deployments.

---

## Local Setup & Quick Start

### Prerequisites
- **Node.js**: v18+ installed.

### 1. Clone & Install Dependencies
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Environment Variables Configuration
Copy `.env.example` in `/server` or set environment variables:
```bash
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Backend & Frontend

#### Start Backend:
```bash
cd server
npm start
```
*(Pre-loads embedding model during boot and starts on `http://localhost:5000`)*

#### Start Frontend:
```bash
cd client
npm run dev
```
*(App will be live on `http://localhost:3000`)*

---

## Step-by-Step Deployment Instructions

### 1. Backend Deployment (Render / Railway)
1. Push your repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
3. Set Root Directory to `server`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables:
   - `LLM_PROVIDER`: `gemini` (or `openai` / `groq`)
   - `GEMINI_API_KEY`: `<Your Key>`
   - `CLIENT_ORIGIN`: `https://your-lumen-frontend.vercel.app`

### 2. Frontend Deployment (Vercel)
1. Import repository to [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Framework Preset: **Vite**.
4. Deploy!

---

## Verification & Test Suite

Run the backend test suite:
```bash
cd server
npm test
```
Verifies embedding output dimensions (384), page-accurate PDF metadata tracking, token chunking counts, and Jaccard deduplication.
