import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Per-Page Tracking',
      desc: 'PDF pages are extracted individually before chunking, preserving page numbers across every vector.'
    },
    {
      num: '02',
      title: 'Token-Accurate Chunking',
      desc: 'Text is split into ~500 token segments using exact tokenizer bounds, avoiding broken context lines.'
    },
    {
      num: '03',
      title: 'Hybrid Reranking',
      desc: 'Combines vector distance and lexical entity scoring to deduplicate and rank relevant context.'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-12 px-4">
      {steps.map((step, idx) => (
        <div
          key={idx}
          className={`p-5 rounded-lg bg-[#16181c] border border-[#212327] animate-stagger-${idx + 1}`}
        >
          <span className="text-xs font-mono text-[#5b6cf0] block mb-2">{step.num}</span>
          <h3 className="text-sm font-semibold text-[#f1f5f9] mb-1">{step.title}</h3>
          <p className="text-xs text-[#94a3b8] leading-relaxed">{step.desc}</p>
        </div>
      ))}
    </div>
  );
}
