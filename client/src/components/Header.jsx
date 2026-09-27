import React from 'react';

export default function Header({ status = 'ready' }) {
  return (
    <header className="border-b border-[#212327] bg-[#0d0e11] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand: Appears ONLY here in top-left header */}
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-5 rounded bg-[#5b6cf0] flex items-center justify-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-white" />
          </div>
          <span className="text-base font-semibold tracking-tight text-[#f1f5f9]">
            Lumen
          </span>
        </div>

        {/* Status Indicator (No badge/pill styling) */}
        <div className="flex items-center space-x-2 text-xs text-[#94a3b8]">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'ready'
                ? 'bg-emerald-500'
                : status === 'processing'
                ? 'bg-[#5b6cf0] animate-pulse'
                : 'bg-rose-500'
            }`}
          />
          <span className="capitalize">{status}</span>
        </div>
      </div>
    </header>
  );
}
