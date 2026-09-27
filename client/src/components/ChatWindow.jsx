import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, AlertCircle, Loader2, BookCheck, ShieldAlert, Sparkles } from 'lucide-react';
import CitationCard from './CitationCard.jsx';

export default function ChatWindow({ sessionId, activeDoc, selectedPrompt, onClearSelectedPrompt }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I've indexed **${activeDoc.filename}** (${activeDoc.pageCount} pages, ${activeDoc.chunkCount} chunks). Ask me any question about this document!`,
      citations: [],
      found: true
    }
  ]);
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSearching]);

  // Listen for sample prompt selection from sidebar
  useEffect(() => {
    if (selectedPrompt) {
      handleSendQuery(selectedPrompt);
      onClearSelectedPrompt();
    }
  }, [selectedPrompt]);

  const handleSendQuery = async (queryText) => {
    if (!queryText || !queryText.trim() || isSearching) return;

    const userQuery = queryText.trim();
    setInput('');

    const userMsg = { id: `user_${Date.now()}`, role: 'user', content: userQuery };
    setMessages((prev) => [...prev, userMsg]);

    setIsSearching(true);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, question: userQuery })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate answer.');
      }

      const botMsg = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        found: data.found
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('[Query Error]', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error: ${err.message}`,
          citations: [],
          found: false
        }
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendQuery(input);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-4 py-4">
      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3.5 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs shrink-0 shadow-lg ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-indigo-600/20'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-600/20'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div className="max-w-[85%] space-y-3">
              <div
                className={`p-4 rounded-3xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none shadow-xl'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>

              {/* Ungrounded / Not Found Warning Banner */}
              {msg.role === 'assistant' && !msg.found && msg.id !== 'welcome' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center space-x-2 text-xs text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    No grounded match found in the uploaded document. The assistant strictly refused to hallucinate.
                  </span>
                </div>
              )}

              {/* Source Citations Section */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 font-mono">
                    <BookCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Grounding Sources ({msg.citations.length} chunks used):</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.citations.map((citation, idx) => (
                      <CitationCard key={citation.id || idx} citation={citation} index={idx} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Searching Loading State */}
        {isSearching && (
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xs shrink-0 shadow-lg">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-tl-none flex items-center space-x-3 shadow-xl">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="font-mono text-xs text-indigo-300 animate-pulse">
                Hybrid vector search (k=8) & generating grounded AI answer...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="pt-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask anything about "${activeDoc.filename}"...`}
            disabled={isSearching}
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-2xl py-4 pl-5 pr-14 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xl"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSearching}
            className="absolute right-2.5 p-2.5 rounded-xl bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
