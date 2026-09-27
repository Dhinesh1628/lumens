import React from 'react';
import { BookOpen, FileText, Sparkles, Layers, ShieldCheck, Cpu, RefreshCw, HelpCircle } from 'lucide-react';

export default function Sidebar({ activeDoc, onResetSession, onSelectSamplePrompt }) {
  const samplePrompts = [
    "What is the name of the bus operator?",
    "What is the total ticket price?",
    "What are the boarding and dropping points?",
    "What is the passenger name and seat number?",
    "What is the journey date and time?",
    "What are the terms and conditions?"
  ];

  return (
    <aside className="w-80 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between h-full p-4 shrink-0 font-sans hidden md:flex">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800/80">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold font-mono text-lg tracking-wider text-white">LUMEN</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2.0 RAG
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Grounded Document Intelligence</p>
          </div>
        </div>

        {/* Active Document Info */}
        {activeDoc && (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Active Document</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <p className="text-xs font-medium text-slate-200 truncate" title={activeDoc.filename}>
              {activeDoc.filename}
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
              <div className="bg-slate-900/80 p-2 rounded-lg text-center border border-slate-800">
                <span className="block text-indigo-400 font-bold">{activeDoc.pageCount}</span>
                <span>Pages</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg text-center border border-slate-800">
                <span className="block text-indigo-400 font-bold">{activeDoc.chunkCount}</span>
                <span>Chunks</span>
              </div>
            </div>

            <button
              onClick={onResetSession}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 rounded-lg transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Upload New Document</span>
            </button>
          </div>
        )}

        {/* Suggested Quick Questions */}
        {activeDoc && (
          <div className="space-y-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Quick Suggested Prompts</span>
            </div>
            <div className="space-y-1.5">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSamplePrompt(prompt)}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-950/40 hover:bg-indigo-500/10 border border-slate-800/60 hover:border-indigo-500/30 text-xs text-slate-300 hover:text-indigo-200 transition-all truncate group"
                >
                  <span className="text-indigo-400 mr-1.5 group-hover:translate-x-0.5 inline-block transition-transform">→</span>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Architecture Badges */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
          <div className="flex items-center space-x-2 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Strict Grounded Response</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Local 384-dim Embeddings</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>Hybrid Lexical + Vector</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 text-center">
        <p className="text-[10px] text-slate-500 font-mono">Lumen Portfolio RAG Architecture</p>
      </div>
    </aside>
  );
}
