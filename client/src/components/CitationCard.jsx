import React, { useState } from 'react';

export default function CitationCard({ citation, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-[#212327] bg-[#16181c] rounded-md overflow-hidden text-xs">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[#212327]/40 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {/* Accent citation tag pill */}
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#5b6cf0]/15 text-[#5b6cf0]">
            #{index + 1}
          </span>
          <span className="text-[#f1f5f9] font-medium">{citation.filename}</span>
          <span className="text-[#94a3b8]">•</span>
          <span className="text-[#94a3b8]">Page {citation.pageNumber}</span>
        </div>
        <span className="text-[#94a3b8] font-mono text-[11px]">
          {isExpanded ? '[-]' : '[+]'}
        </span>
      </button>

      {isExpanded && (
        <div className="p-3 border-t border-[#212327] bg-[#0d0e11] font-mono text-[11px] text-[#94a3b8] leading-relaxed whitespace-pre-wrap">
          {citation.text}
        </div>
      )}
    </div>
  );
}
