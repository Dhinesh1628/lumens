import React, { useState, useRef } from 'react';
import HeroScene from './HeroScene.jsx';

export default function Hero({ onUploadSuccess, sessionId }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    setError(null);

    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
      setError('Unsupported file type. Please upload a PDF or TXT file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload document.');
      }

      setIsUploading(false);
      onUploadSuccess(data);
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
    <section className="relative min-h-[82vh] flex flex-col items-center justify-center py-12 px-6 overflow-hidden">
      {/* 3D Wireframe Scene Background */}
      <HeroScene />

      {/* Content Layer */}
      <div className="relative z-10 w-full max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#f1f5f9] leading-tight">
          Document Q&A grounded strictly in source context
        </h1>
        <p className="text-sm sm:text-base text-[#94a3b8] max-w-xl mx-auto leading-relaxed">
          Upload PDF or TXT files to query facts with exact page-number citations and zero hallucination.
        </p>

        {/* Upload Zone Card */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`mt-8 p-10 rounded-xl bg-[#16181c] border transition-colors cursor-pointer text-center ${
            isDragging
              ? 'border-[#5b6cf0]'
              : 'border-[#212327] hover:border-[#5b6cf0]'
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
            <div className="py-6 space-y-3">
              <div className="w-6 h-6 border-2 border-[#5b6cf0] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#94a3b8]">Processing and indexing document chunks...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#f1f5f9]">
                Drop PDF or TXT file here, or <span className="text-[#5b6cf0] underline underline-offset-4">select file</span>
              </p>
              <p className="text-xs text-[#94a3b8]">Maximum file size: 10MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
