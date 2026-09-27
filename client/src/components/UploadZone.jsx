import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2, CheckCircle2, ShieldCheck, Sparkles, Layers } from 'lucide-react';

export default function UploadZone({ onUploadSuccess, sessionId }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    setError(null);

    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
      setError('Invalid file type. Please upload a PDF (.pdf) or Plain Text (.txt) document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadStep(1);
    setStatusMessage('Extracting per-page text & metadata...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    try {
      setTimeout(() => {
        setUploadStep(2);
        setStatusMessage('Generating 384-dim local embeddings (Xenova)...');
      }, 700);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process document.');
      }

      setUploadStep(3);
      setStatusMessage('Indexing vector store collections & TTL timers...');

      setTimeout(() => {
        setIsUploading(false);
        onUploadSuccess(data);
      }, 500);

    } catch (err) {
      console.error('[Upload Error]', err);
      setError(err.message || 'An error occurred during upload.');
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-auto px-4 py-8">
      {/* Title & Tagline */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full-Stack Grounded RAG Platform</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Upload Your Document to <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Lumen</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Ask natural-language questions grounded strictly in your PDFs & TXT files with precise page-number citations.
        </p>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 shadow-2xl ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.txt,application/pdf,text/plain"
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <FileText className="w-7 h-7 text-indigo-400 absolute inset-0 m-auto" />
            </div>

            <div className="space-y-2 text-center">
              <p className="text-base font-semibold text-slate-200">Processing & Vectorizing Document...</p>
              <p className="text-xs text-indigo-300 font-mono animate-pulse">{statusMessage}</p>
            </div>

            {/* Step Progress Bar */}
            <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 pt-2">
              <span className={`px-2.5 py-1 rounded-full border ${uploadStep >= 1 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800 border-slate-700'}`}>
                1. Extract
              </span>
              <span>→</span>
              <span className={`px-2.5 py-1 rounded-full border ${uploadStep >= 2 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800 border-slate-700'}`}>
                2. Embed (384-dim)
              </span>
              <span>→</span>
              <span className={`px-2.5 py-1 rounded-full border ${uploadStep >= 3 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800 border-slate-700'}`}>
                3. Index Vector DB
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <p className="text-base font-semibold text-slate-200">
                Drag & drop your document here, or <span className="text-indigo-400 underline decoration-indigo-500/40 underline-offset-4">browse files</span>
              </p>
              <p className="text-xs text-slate-400">
                Supports <span className="font-semibold text-slate-300">PDF</span> or <span className="font-semibold text-slate-300">TXT</span> files (Max 10MB)
              </p>
            </div>

            {/* Feature Pills */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-400 font-mono">
              <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">
                ✓ Per-page tracking
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">
                ✓ Token-accurate chunking
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">
                ✓ Hybrid Reranking
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
