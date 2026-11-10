import React, { useState } from 'react';
import { 
  FileText, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Terminal, 
  Database, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

export default function DocsPage({ onNavigateToApp }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 font-sans space-y-16 animate-fade-in-up">
      {/* Hero Header */}
      <div className="space-y-4 border-b border-[#212327] pb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#16181c] border border-[#212327] text-xs font-mono text-[#5b6cf0]">
          <Code2 className="w-3.5 h-3.5" />
          <span>Technical Architecture & Developer Reference</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#f1f5f9]">
          Lumen Architecture & Documentation
        </h1>
        <p className="text-base text-[#94a3b8] max-w-3xl leading-relaxed">
          Lumen is an open-source, deterministic Retrieval-Augmented Generation (RAG) system engineered 
          to eliminate LLM hallucinations by preserving exact page-number metadata across every parsed chunk 
          and enforcing strict negative-constraint prompts.
        </p>
      </div>

      {/* Quick Spec Matrix */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#f1f5f9] flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-[#5b6cf0]" />
          <span>Technical Specifications</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-[#16181c] border border-[#212327]">
            <span className="text-[#94a3b8] block mb-1">Embedding Model</span>
            <span className="text-[#f1f5f9] font-semibold text-sm">Xenova/all-MiniLM-L6-v2</span>
            <span className="text-[#5b6cf0] block mt-1">384-dimensional dense vectors</span>
          </div>
          <div className="p-4 rounded-lg bg-[#16181c] border border-[#212327]">
            <span className="text-[#94a3b8] block mb-1">Tokenizer Engine</span>
            <span className="text-[#f1f5f9] font-semibold text-sm">js-tiktoken (cl100k_base)</span>
            <span className="text-[#5b6cf0] block mt-1">500 tokens / 50 overlap</span>
          </div>
          <div className="p-4 rounded-lg bg-[#16181c] border border-[#212327]">
            <span className="text-[#94a3b8] block mb-1">Vector Storage</span>
            <span className="text-[#f1f5f9] font-semibold text-sm">ChromaDB + Memory Store</span>
            <span className="text-[#5b6cf0] block mt-1">24h TTL / 50-collection cap</span>
          </div>
          <div className="p-4 rounded-lg bg-[#16181c] border border-[#212327]">
            <span className="text-[#94a3b8] block mb-1">Re-Ranking Strategy</span>
            <span className="text-[#f1f5f9] font-semibold text-sm">Jaccard & Diversity</span>
            <span className="text-[#5b6cf0] block mt-1">Sim threshold &gt; 0.55 cutoff</span>
          </div>
        </div>
      </section>

      {/* End-to-End Pipeline */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-[#f1f5f9] flex items-center space-x-2">
          <Layers className="w-5 h-5 text-[#5b6cf0]" />
          <span>Ingestion & Retrieval Pipeline</span>
        </h2>
        
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#16181c] border border-[#212327] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-[#5b6cf0]">Step 01</span>
                <h3 className="text-base font-semibold text-[#f1f5f9] mt-1">
                  Page-Accurate Text Extraction
                </h3>
              </div>
              <FileText className="w-5 h-5 text-[#94a3b8]" />
            </div>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Standard PDF text extractors concatenate all pages into one continuous string, losing original document geometry. 
              Lumen injects a custom <code className="text-[#5b6cf0] bg-[#0d0e11] px-1.5 py-0.5 rounded">pagerender</code> hook 
              into <code className="text-[#5b6cf0] bg-[#0d0e11] px-1.5 py-0.5 rounded">pdf-parse</code> to extract text page-by-page. 
              Plain text files are split with synthetic line pagination. Every emitted page carries an immutable <code className="text-[#5b6cf0] bg-[#0d0e11] px-1.5 py-0.5 rounded">pageNumber</code>.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#16181c] border border-[#212327] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-[#5b6cf0]">Step 02</span>
                <h3 className="text-base font-semibold text-[#f1f5f9] mt-1">
                  Token-Accurate Chunking with Overlap
                </h3>
              </div>
              <Cpu className="w-5 h-5 text-[#94a3b8]" />
            </div>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Instead of guessing chunks by character count or paragraph breaks, Lumen runs exact BPE tokenization using 
              <code className="text-[#5b6cf0] bg-[#0d0e11] px-1.5 py-0.5 rounded">js-tiktoken</code> with OpenAI’s 
              <code className="text-[#5b6cf0] bg-[#0d0e11] px-1.5 py-0.5 rounded">cl100k_base</code> encoding. 
              Windows are calibrated to 500 tokens with a 50-token sliding overlap. If a page boundary is reached, chunks are split cleanly 
              to ensure citation attribution never bridges ambiguously across page divides.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#16181c] border border-[#212327] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-[#5b6cf0]">Step 03</span>
                <h3 className="text-base font-semibold text-[#f1f5f9] mt-1">
                  Local ONNX Transformer Embeddings
                </h3>
              </div>
              <Database className="w-5 h-5 text-[#94a3b8]" />
            </div>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Embeddings run locally in the Node.js process using <code className="text-[#5b6cf0] bg-[#0d0e11] px-1.5 py-0.5 rounded">@xenova/transformers</code>. 
              The server loads <code className="text-[#5b6cf0] bg-[#0d0e11] px-1.5 py-0.5 rounded">Xenova/all-MiniLM-L6-v2</code> into memory 
              during application startup, ensuring zero latency on third-party rate limits and zero cost per vector call.
              Embeddings are verified with a 384-dimension assertion before store commits.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#16181c] border border-[#212327] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-[#5b6cf0]">Step 04</span>
                <h3 className="text-base font-semibold text-[#f1f5f9] mt-1">
                  Jaccard Deduplication & Diversity Re-Ranking
                </h3>
              </div>
              <Search className="w-5 h-5 text-[#94a3b8]" />
            </div>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Cosine similarity candidate retrieval often returns redundant chunks spanning consecutive sliding windows. 
              Lumen pulls the top <code className="text-[#5b6cf0] bg-[#0d0e11] px-1.5 py-0.5 rounded">k=8</code> candidates, 
              applies a Jaccard token overlap filter (discarding candidates with &gt; 0.55 similarity to already-selected chunks), 
              and enforces page-diversity re-ranking to deliver the top 4 most distinct, high-signal passages to the LLM.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#16181c] border border-[#212327] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-[#5b6cf0]">Step 05</span>
                <h3 className="text-base font-semibold text-[#f1f5f9] mt-1">
                  Strict Grounded Generation & Negative Attribution
                </h3>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#94a3b8]" />
            </div>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              The synthesized prompt instructs the model to answer exclusively from the provided source passages. If the answer cannot 
              be derived directly from the document snippets, the model is strictly bound to reply that the information is not present. 
              Every fact generated is linked to the corresponding chunk’s page number, displayed to the user in interactive citation cards.
            </p>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#f1f5f9] flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-[#5b6cf0]" />
            <span>HTTP API Reference</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8]">
            The Lumen Express backend exposes clean REST endpoints for headless integration and portfolio verification.
          </p>
        </div>

        {/* Upload Endpoint */}
        <div className="rounded-xl bg-[#16181c] border border-[#212327] overflow-hidden">
          <div className="p-4 bg-[#121316] border-b border-[#212327] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                POST
              </span>
              <span className="font-mono text-xs sm:text-sm text-[#f1f5f9]">/upload</span>
            </div>
            <span className="text-xs text-[#94a3b8]">multipart/form-data</span>
          </div>
          <div className="p-5 space-y-4 text-xs">
            <p className="text-[#94a3b8]">
              Accepts a single <code className="text-[#5b6cf0]">file</code> (<code className="text-[#f1f5f9]">application/pdf</code> or <code className="text-[#f1f5f9]">text/plain</code>, max 10MB) 
              and a <code className="text-[#5b6cf0]">sessionId</code>. Validates MIME headers via Multer, splits into chunks, computes 384-dim embeddings, and persists into the vector collection.
            </p>
            <div>
              <div className="flex justify-between items-center text-[#94a3b8] font-mono text-[11px] mb-1">
                <span>Sample 200 OK Response:</span>
                <button
                  onClick={() => handleCopy('upload', '{\n  "sessionId": "session_1731219200000",\n  "filename": "quarterly-report.pdf",\n  "pageCount": 14,\n  "chunkCount": 38\n}')}
                  className="flex items-center space-x-1 text-[#5b6cf0] hover:text-[#5b6cf0]/80"
                >
                  {copiedId === 'upload' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'upload' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded bg-[#0d0e11] border border-[#212327] font-mono text-xs text-[#f1f5f9] overflow-x-auto">
{`{
  "sessionId": "session_1731219200000",
  "filename": "quarterly-report.pdf",
  "pageCount": 14,
  "chunkCount": 38
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Query Endpoint */}
        <div className="rounded-xl bg-[#16181c] border border-[#212327] overflow-hidden">
          <div className="p-4 bg-[#121316] border-b border-[#212327] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                POST
              </span>
              <span className="font-mono text-xs sm:text-sm text-[#f1f5f9]">/query</span>
            </div>
            <span className="text-xs text-[#94a3b8]">application/json</span>
          </div>
          <div className="p-5 space-y-4 text-xs">
            <p className="text-[#94a3b8]">
              Executes semantic vector search for the question, filters candidates with Jaccard deduplication, and sends strictly grounded context to the configured LLM.
            </p>
            <div>
              <div className="flex justify-between items-center text-[#94a3b8] font-mono text-[11px] mb-1">
                <span>Sample 200 OK Response:</span>
                <button
                  onClick={() => handleCopy('query', '{\n  "answer": "Operating revenue increased by 18.4% year-over-year.",\n  "citations": [\n    {\n      "chunkIndex": 3,\n      "pageNumber": 2,\n      "text": "Total operating revenue reached $42.8M, representing an 18.4% YoY gain..."\n    }\n  ],\n  "found": true\n}')}
                  className="flex items-center space-x-1 text-[#5b6cf0] hover:text-[#5b6cf0]/80"
                >
                  {copiedId === 'query' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'query' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded bg-[#0d0e11] border border-[#212327] font-mono text-xs text-[#f1f5f9] overflow-x-auto">
{`{
  "answer": "Operating revenue increased by 18.4% year-over-year.",
  "citations": [
    {
      "chunkIndex": 3,
      "pageNumber": 2,
      "text": "Total operating revenue reached $42.8M, representing an 18.4% YoY gain..."
    }
  ],
  "found": true
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Health Endpoint */}
        <div className="rounded-xl bg-[#16181c] border border-[#212327] overflow-hidden">
          <div className="p-4 bg-[#121316] border-b border-[#212327] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">
                GET
              </span>
              <span className="font-mono text-xs sm:text-sm text-[#f1f5f9]">/health</span>
            </div>
            <span className="text-xs text-[#94a3b8]">Warm-up & Diagnostic</span>
          </div>
          <div className="p-5 space-y-4 text-xs">
            <p className="text-[#94a3b8]">
              Used by frontend health polling to track cold starts on free-tier container platforms (Render, Railway). Returns model memory state and total active collection count.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-[#16181c] to-[#1d2026] border border-[#212327] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-bold text-[#f1f5f9]">
            Ready to test with your own documents?
          </h3>
          <p className="text-xs sm:text-sm text-[#94a3b8]">
            Drop any PDF or TXT file into the interactive playground to inspect chunks and verify citations live.
          </p>
        </div>
        <button
          onClick={onNavigateToApp}
          className="shrink-0 px-6 py-3 rounded-lg bg-[#5b6cf0] hover:bg-[#5b6cf0]/90 text-white text-xs font-semibold flex items-center space-x-2 transition-colors shadow-lg shadow-[#5b6cf0]/20"
        >
          <span>Open Playground</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
