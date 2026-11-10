import React from 'react';
import { Github, ExternalLink, BookOpen, User, Sparkles } from 'lucide-react';

export default function Header({ status = 'ready', currentRoute = '/', onNavigate }) {
  return (
    <header className="border-b border-[#212327] bg-[#0d0e11]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center space-x-2.5 group focus:outline-none text-left"
        >
          <div className="w-5 h-5 rounded bg-[#5b6cf0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="w-2 h-2 rounded-full bg-white" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-semibold tracking-tight text-[#f1f5f9] group-hover:text-white transition-colors">
              Lumen
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#16181c] border border-[#212327] text-[#94a3b8]">
              RAG
            </span>
          </div>
        </button>

        {/* Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs">
          <button
            onClick={() => onNavigate('/')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              currentRoute === '/'
                ? 'bg-[#16181c] text-[#f1f5f9] font-medium border border-[#212327]'
                : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#16181c]/50'
            }`}
          >
            Playground
          </button>
          <button
            onClick={() => onNavigate('/docs')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 ${
              currentRoute === '/docs'
                ? 'bg-[#16181c] text-[#f1f5f9] font-medium border border-[#212327]'
                : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#16181c]/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Docs</span>
          </button>
          <button
            onClick={() => onNavigate('/about')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 ${
              currentRoute === '/about'
                ? 'bg-[#16181c] text-[#f1f5f9] font-medium border border-[#212327]'
                : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#16181c]/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>About</span>
          </button>
        </nav>

        {/* Right Tools: GitHub & Status */}
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/Dhinesh1628/lumens"
            target="_blank"
            rel="noopener noreferrer"
            title="View Dhinesh1628/lumens on GitHub"
            className="flex items-center space-x-1.5 text-xs text-[#94a3b8] hover:text-[#f1f5f9] transition-colors py-1 px-2 rounded-md hover:bg-[#16181c]"
          >
            <Github className="w-4 h-4" />
            <span className="hidden md:inline font-mono text-[11px]">GitHub</span>
          </a>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2 text-xs text-[#94a3b8] pl-2 border-l border-[#212327]">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'ready'
                  ? 'bg-emerald-500'
                  : status === 'processing'
                  ? 'bg-[#5b6cf0] animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            <span className="capitalize hidden sm:inline">{status}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
