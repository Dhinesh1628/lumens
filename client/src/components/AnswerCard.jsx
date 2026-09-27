import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import CitationCard from './CitationCard.jsx';

export default function AnswerCard({ sessionId, activeDoc, onResetSession }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Document indexed: **${activeDoc.filename}** (${activeDoc.pageCount} pages, ${activeDoc.chunkCount} chunks). Ask any question grounded in this document context.`,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSearching) return;

    const userQuery = input.trim();
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
        throw new Error(data.error || 'Failed to query document.');
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
          content: `Error: ${err.message}`,
          citations: [],
          found: false
        }
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto w-full px-6 py-6 font-sans">
      {/* Active Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#212327] mb-6 text-xs text-[#94a3b8]">
        <div className="flex items-center space-x-2">
          <span>Active document:</span>
          <span className="text-[#f1f5f9] font-medium">{activeDoc.filename}</span>
          <span>({activeDoc.pageCount} pages)</span>
        </div>
        <button
          onClick={onResetSession}
          className="text-[#5b6cf0] hover:underline text-xs"
        >
          Upload new file
        </button>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {msg.role === 'user' ? (
              /* Question in muted text */
              <div className="text-xs text-[#94a3b8] font-medium">
                Q: {msg.content}
              </div>
            ) : (
              /* Answer in full-opacity text inside minimal #16181c card */
              <div className="p-4 rounded-lg bg-[#16181c] border border-[#212327] text-sm text-[#f1f5f9] leading-relaxed space-y-3">
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {!msg.found && msg.id !== 'welcome' && (
                  <div className="text-xs text-amber-400/90 pt-1">
                    No matching content found in document. Answer explicitly rejected.
                  </div>
                )}

                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-3 border-t border-[#212327] space-y-2">
                    <div className="text-xs text-[#94a3b8]">
                      Retrieved source citations ({msg.citations.length}):
                    </div>
                    <div className="space-y-1.5">
                      {msg.citations.map((cit, idx) => (
                        <CitationCard key={cit.id || idx} citation={cit} index={idx} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isSearching && (
          <div className="p-4 rounded-lg bg-[#16181c] border border-[#212327] text-xs text-[#94a3b8] flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5b6cf0] animate-pulse" />
            <span>Retrieving vectors and generating answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="pt-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this document..."
            disabled={isSearching}
            className="flex-1 bg-[#16181c] border border-[#212327] focus:border-[#5b6cf0] rounded-md px-4 py-2.5 text-xs text-[#f1f5f9] placeholder-[#94a3b8]/60 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSearching}
            className="px-4 py-2.5 rounded-md bg-[#5b6cf0] text-white text-xs font-medium hover:bg-[#5b6cf0]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}
