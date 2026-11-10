import React from 'react';
import { 
  Github, 
  ExternalLink, 
  CheckCircle, 
  ShieldAlert, 
  Code2, 
  Terminal, 
  Heart, 
  User, 
  FileCheck2,
  Sparkles,
  Layers
} from 'lucide-react';

export default function AboutPage({ onNavigateToApp }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans space-y-16 animate-fade-in-up">
      {/* Header */}
      <div className="space-y-4 border-b border-[#212327] pb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#16181c] border border-[#212327] text-xs font-mono text-[#5b6cf0]">
          <User className="w-3.5 h-3.5" />
          <span>About Lumen & The Project Origin</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#f1f5f9]">
          Built to replace speculative summaries with verifiable citations.
        </h1>
        <p className="text-base text-[#94a3b8] leading-relaxed">
          Lumen was engineered by <a href="https://github.com/Dhinesh1628" target="_blank" rel="noopener noreferrer" className="text-[#5b6cf0] hover:underline font-medium">Dhinesh</a> as 
          an open-source reference implementation of deterministic, strictly grounded document intelligence.
        </p>
      </div>

      {/* The Problem: Why another PDF tool? */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#f1f5f9]">
          The Problem: The "AI Slop" of Document Q&A
        </h2>
        <div className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed space-y-4">
          <p>
            Most &ldquo;chat with your PDF&rdquo; tools on the web are superficial wrappers around raw LLM APIs. 
            They dump raw text into a single prompt, guess chunk splits by arbitrary character lengths, 
            and let the LLM hallucinate answers when the document contains no relevant data.
          </p>
          <p>
            When researching contracts, financial filings, technical papers, or system architecture manuals, 
            an answer without a verifiable page citation is worse than useless—it is misleading. 
            A user cannot afford to manually audit 80 pages to see whether a model invented a clause or actually read it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-xl bg-[#16181c] border border-rose-500/20 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Generic AI Document Wrappers</span>
            </div>
            <ul className="space-y-2 text-xs text-[#94a3b8]">
              <li className="flex items-start space-x-2">
                <span className="text-rose-400">✕</span>
                <span>Loss of page numbers during bulk string extraction.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400">✕</span>
                <span>Arbitrary character chunking that chops words and tables in half.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400">✕</span>
                <span>Pleasant-sounding hallucinations when questions are out of scope.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400">✕</span>
                <span>Expensive per-embedding API costs that fail under rate limits.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-[#16181c] border border-emerald-500/20 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>The Lumen Approach</span>
            </div>
            <ul className="space-y-2 text-xs text-[#94a3b8]">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>Page-accurate text extraction using custom PDF renderer callbacks.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>Exact BPE token bounds via js-tiktoken (500 tokens / 50 overlap).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>Strict negative prompt contracts: reject answers when facts are missing.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>Zero embedding API cost via local Xenova all-MiniLM-L6-v2 ONNX models.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Engineering Principles */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#f1f5f9]">
          Engineering Principles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#16181c] border border-[#212327] space-y-2">
            <span className="text-xs font-mono text-[#5b6cf0]">01 / Verifiability</span>
            <h3 className="text-sm font-semibold text-[#f1f5f9]">Proof Over Persuasion</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Every single response surfaces raw chunk text and the physical page number it came from, 
              so the reader can independently verify the source in seconds.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#16181c] border border-[#212327] space-y-2">
            <span className="text-xs font-mono text-[#5b6cf0]">02 / Determinism</span>
            <h3 className="text-sm font-semibold text-[#f1f5f9]">Strict Chunk Bounds</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Splitting text by token counts rather than regex whitespace ensures consistent vector density 
              and guarantees chunks never overflow model context limits.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#16181c] border border-[#212327] space-y-2">
            <span className="text-xs font-mono text-[#5b6cf0]">03 / Privacy & Cost</span>
            <h3 className="text-sm font-semibold text-[#f1f5f9]">Local First Inference</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Embeddings are computed on the host CPU using ONNX runtime bindings. Your document vectors never 
              leave the application server for vectorization.
            </p>
          </div>
        </div>
      </section>

      {/* Maker Profile & Repository */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#16181c] border border-[#212327] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#212327] pb-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#f1f5f9] flex items-center space-x-2">
              <span>Maker & Open Source Repository</span>
            </h2>
            <p className="text-xs text-[#94a3b8]">
              Designed and maintained by Dhinesh (<span className="font-mono text-[#5b6cf0]">@Dhinesh1628</span>)
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/Dhinesh1628"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg bg-[#0d0e11] hover:bg-[#212327] border border-[#212327] text-xs font-medium text-[#f1f5f9] flex items-center space-x-2 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Maker Profile</span>
            </a>
            <a
              href="https://github.com/Dhinesh1628/lumens"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg bg-[#5b6cf0] hover:bg-[#5b6cf0]/90 text-white text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm"
            >
              <Github className="w-4 h-4" />
              <span>GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <h3 className="font-semibold text-[#f1f5f9] flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-[#5b6cf0]" />
              <span>Tech Stack</span>
            </h3>
            <p className="text-[#94a3b8] leading-relaxed">
              React 18, Vite 6, Tailwind CSS v4, Lucide Icons, Three.js (interactive particle hero), 
              Node.js Express backend (ES Modules), @xenova/transformers, js-tiktoken, ChromaDB vector store, 
              and LangChain LLM adapters.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-[#f1f5f9] flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Open Source License</span>
            </h3>
            <p className="text-[#94a3b8] leading-relaxed">
              Lumen is released under the permissive <span className="text-[#f1f5f9] font-medium">MIT License</span>. 
              The entire codebase, test suite, and deployment configurations are publicly available to inspect, fork, or self-host.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation CTA */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onNavigateToApp}
          className="text-xs text-[#5b6cf0] hover:underline flex items-center space-x-1"
        >
          <span>← Back to Document Playground</span>
        </button>
        <span className="text-[11px] font-mono text-[#64748b]">
          Version 1.0.0 · MIT License
        </span>
      </div>
    </div>
  );
}
