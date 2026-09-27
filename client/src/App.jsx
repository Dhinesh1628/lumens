import React, { useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import AnswerCard from './components/AnswerCard.jsx';

export default function App() {
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [activeDoc, setActiveDoc] = useState(null);

  const handleUploadSuccess = (data) => {
    setActiveDoc({
      filename: data.filename,
      pageCount: data.pageCount,
      chunkCount: data.chunkCount
    });
  };

  const handleResetSession = () => {
    setSessionId(`session_${Date.now()}`);
    setActiveDoc(null);
  };

  return (
    <div className="min-h-screen bg-[#0d0e11] text-[#f1f5f9] flex flex-col font-sans selection:bg-[#5b6cf0] selection:text-white">
      <Header status={activeDoc ? 'ready' : 'ready'} />

      <main className="flex-1 flex flex-col justify-center">
        {!activeDoc ? (
          <div>
            <Hero
              onUploadSuccess={handleUploadSuccess}
              sessionId={sessionId}
            />
            <HowItWorks />
          </div>
        ) : (
          <AnswerCard
            sessionId={sessionId}
            activeDoc={activeDoc}
            onResetSession={handleResetSession}
          />
        )}
      </main>
    </div>
  );
}
