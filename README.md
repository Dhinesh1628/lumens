# Lumen — Grounded Full-Stack RAG Document Q&A

**Lumen** is an open-source, deterministic Retrieval-Augmented Generation (RAG) document intelligence platform. It ingests PDF and plain-text files, extracts per-page text with physical page boundaries, constructs token-accurate semantic chunks, embeds chunks locally using dense vector embeddings, and answers user questions strictly grounded in the document context with verifiable page-level citations.

---

## 1. Problem Statement

Most document Q&A tools and generic LLM wrappers suffer from three critical failures:
1. **Hallucination under Uncertainty**: When documents lack relevant facts, generic wrappers fabricate believable answers instead of reporting missing evidence.
2. **Missing Source Traceability**: Flat text dumps erase page numbers, preventing users from validating answers in original contracts, financial filings, and system manuals.
3. **Context Window Pollution**: Chunking naively by arbitrary character counts or including repetitive paragraphs causes redundant candidates to dilute LLM attention ("Lost in the Middle").

Lumen resolves these issues with deterministic per-page tracking, token-precise chunking (`cl100k_base`), local semantic vector search, Jaccard near-duplicate filtering, and strict negative-constraint prompt engineering.

---

## 2. Key Features

- **Page-Accurate PDF Extraction**: Custom `pagerender` pipeline tracks physical page numbers for every extracted token chunk.
- **Token-Accurate Chunking**: Powered by `js-tiktoken` (`cl100k_base`) with a target size of ~500 tokens and 50-token semantic overlap.
- **Local Dense Embeddings**: Employs `Xenova/all-MiniLM-L6-v2` producing 384-dimensional dense vectors locally via ONNX runtime without external API latency or costs.
- **ChromaDB Vector Store & In-Memory Fallback**: Vector similarity indexing with fallback to cosine vector memory index.
- **Jaccard Deduplication & Diversity Re-Ranking**: Top-8 similarity candidates are filtered for lexical near-duplicates (Jaccard similarity threshold 0.55) and re-ranked for document position diversity down to top-4 chunks.
- **Grounded Prompting**: Strict guardrails instruct the LLM to admit when facts are absent and provide exact page-level citations.
- **Clean Engineering UX**: Fast SPA client with live health probing, cold-start handling, and interactive documentation.

---

## 3. Technology Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS v4, Lucide React, React Markdown, Three.js (hero visualizer).
- **Backend**: Node.js (ESM), Express 4, Multer (file upload validation with 10MB limit and MIME filtering).
- **Embedding & Tokenization**: `@xenova/transformers` (`all-MiniLM-L6-v2`, 384 dims), `js-tiktoken` (`cl100k_base`).
- **Parsing**: `pdf-parse` with custom page render hooks, plain-text utf-8 decoder.
- **Vector Storage**: `chromadb` client with fallback memory store.
- **LLM Integrations**: Google Gemini (`@langchain/google-genai`), Groq (`@langchain/groq`), OpenAI (`@langchain/openai`).

---

## 4. Architecture Overview

```
 +------------------------+              +--------------------------+
 |   React + Vite Client  |  POST /upload|    Express API Server    |
 |   Tailwind CSS UI      | -----------> |    (Node.js / ESM)       |
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

## 5. Project Folder Structure

```
lumen/
├── client/
│   ├── public/
│   │   ├── fonts/               # Self-hosted brand web fonts
│   │   ├── favicon.svg          # App icon
│   │   └── og-image.png         # Social share asset
│   ├── src/
│   │   ├── components/          # Header, Hero, AnswerCard, DocsPage, AboutPage, Footer
│   │   ├── api.js               # Centralized client API service
│   │   ├── App.jsx              # Main app component & view router
│   │   ├── main.jsx             # React DOM root entry
│   │   └── index.css            # Tailwind CSS styling and theme tokens
│   ├── index.html               # HTML5 shell with meta tags & font preloads
│   ├── package.json             # Frontend dependencies & scripts
│   ├── vercel.json              # Client SPA rewrite rules
│   └── vite.config.js           # Vite development server configuration & proxy
├── server/
│   ├── src/
│   │   ├── config.js            # Environment config & constants
│   │   ├── embeddings.js        # Xenova transformer embedding generator
│   │   ├── vectorStore.js       # ChromaDB / memory vector store manager
│   │   ├── chunker.js           # js-tiktoken page-aware chunker
│   │   ├── parser.js            # Per-page PDF & TXT parser
│   │   ├── reranker.js          # Jaccard deduplication & diversity re-ranking
│   │   ├── llm.js               # Multi-provider LLM caller
│   │   └── index.js             # Express API application & endpoints
│   ├── tests/
│   │   └── run-tests.js         # Backend verification unit tests
│   ├── .env.example             # Backend environment template
│   └── package.json             # Server dependencies & scripts
├── vercel.json                  # Root monorepo deployment config for Vercel
├── .env.example                 # Root environment template
├── .gitignore                   # Git ignore rules
└── README.md                    # Project documentation
```

---

## 6. Installation Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup Steps
```bash
# Clone the repository
git clone https://github.com/Dhinesh1628/lumens.git
cd lumens

# Install Backend dependencies
cd server
npm install

# Install Frontend dependencies
cd ../client
npm install
```

---

## 7. Environment Configuration

Create `.env` inside `server/` with:
```env
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
# Optional alternatives:
# LLM_PROVIDER=openai
# OPENAI_API_KEY=your_openai_api_key_here
# LLM_PROVIDER=groq
# GROQ_API_KEY=your_groq_api_key_here
```

For the frontend client, set `VITE_API_URL` if hosting backend on an external server:
```env
VITE_API_URL=https://your-backend-api.onrender.com
```

---

## 8. Database Setup

Lumen utilizes an embedded vector store architecture:
- By default, it initializes an in-memory vector collection with 384-dimensional cosine similarity indexing.
- When ChromaDB is running locally (`CHROMA_URL=http://localhost:8000`), it automatically establishes connection with collection TTL cleanup (24-hour expiration) and an active collection hard cap of 50.
- No separate external database installation or migration scripts are required for development.

---

## 9. API Endpoint Summary

| Method | Endpoint | Description | Request Body / Params | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Health check & model pre-warm status | None | `{ status: "ok", embeddingModel, embeddingDim, timestamp }` |
| `POST` | `/api/upload` | Upload & ingest document | `multipart/form-data` with `file`, `sessionId` | `{ success: true, filename, pageCount, chunkCount }` |
| `POST` | `/api/query` | Grounded Q&A against document | `{ sessionId: string, question: string }` | `{ answer: string, citations: [{ page, chunk, text }] }` |

---

## 10. Testing Instructions

Run the backend verification suite:
```bash
cd server
npm test
```

Test validations performed:
1. **Embedding Dimension Safety**: Validates that Xenova produces 384-dimensional dense vectors.
2. **Page-Accurate Extraction & Token Chunking**: Validates that multi-page PDFs preserve exact 1-to-1 page number mappings.
3. **Jaccard Deduplication & Re-Ranking**: Validates filtering of duplicate chunks ($>0.55$ similarity) before LLM context generation.

Frontend build check:
```bash
cd client
npm run build
```

---

## 11. Deployment Instructions

### Backend (Render / Railway)
1. Create a Web Service connected to your repository.
2. Set Root Directory to `server`.
3. Set Build Command to `npm install` and Start Command to `npm start`.
4. Configure Environment Variables: `LLM_PROVIDER`, `GEMINI_API_KEY`, `CLIENT_ORIGIN`.

### Frontend (Vercel)
1. Import repository to Vercel.
2. Set Framework Preset to **Vite** (root `vercel.json` automatically executes `cd client && npm install && npm run build`).
3. Add Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`.
4. Deploy!

---

## 12. Known Limitations

- **OCR for Scanned PDFs**: Ingests text-based PDFs; scanned document image OCR requires external tesseract integration.
- **Local In-Memory Cache**: Active collections reset upon server restart unless backed by persistent ChromaDB instance.
- **Free-Tier Render Cold Starts**: Free hosting tier spins down after inactivity; initial request takes ~20 seconds to warm up ONNX embedding weights.
