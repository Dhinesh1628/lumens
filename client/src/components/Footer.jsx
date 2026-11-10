import React from 'react';
import { Github, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ onNavigate, currentRoute }) {
  return (
    <footer className="border-t border-[#212327] bg-[#0d0e11] mt-auto text-xs text-[#94a3b8] font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#212327]/80">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-5 h-5 rounded bg-[#5b6cf0] flex items-center justify-center shrink-0">
                <span className="w-2 h-2 rounded-full bg-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-[#f1f5f9]">
                Lumen
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#16181c] border border-[#212327] text-[#5b6cf0]">
                RAG Engine
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] max-w-sm leading-relaxed">
              Open-source, deterministic Retrieval-Augmented Generation document Q&A. 
              Extracts text page-by-page from PDFs and text files with verifiable citations and zero hallucination.
            </p>
            <div className="flex items-center space-x-2 pt-1 text-[11px] font-mono text-[#64748b]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Negative Prompt Safeguards · Local Embeddings</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#f1f5f9]">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className={`hover:text-[#f1f5f9] transition-colors ${
                    currentRoute === '/' ? 'text-[#5b6cf0] font-medium' : 'text-[#94a3b8]'
                  }`}
                >
                  Document Playground
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/docs')}
                  className={`hover:text-[#f1f5f9] transition-colors ${
                    currentRoute === '/docs' ? 'text-[#5b6cf0] font-medium' : 'text-[#94a3b8]'
                  }`}
                >
                  Architecture & Docs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className={`hover:text-[#f1f5f9] transition-colors ${
                    currentRoute === '/about' ? 'text-[#5b6cf0] font-medium' : 'text-[#94a3b8]'
                  }`}
                >
                  About the Project
                </button>
              </li>
            </ul>
          </div>

          {/* Open Source & Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#f1f5f9]">
              Open Source
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/Dhinesh1628/lumens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Dhinesh1628"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                >
                  <span>Maker (@Dhinesh1628)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Dhinesh1628/lumens/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                >
                  <span>Issue Tracker</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#64748b]">
          <div className="flex items-center space-x-1">
            <span>Built by Dhinesh · Released under the</span>
            <a
              href="https://github.com/Dhinesh1628/lumens/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#94a3b8] hover:underline"
            >
              MIT License
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <span>Client v1.0.0</span>
            <span>·</span>
            <span>Vite + React</span>
            <span>·</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
