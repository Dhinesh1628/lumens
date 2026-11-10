import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import AnswerCard from './components/AnswerCard.jsx';
import DocsPage from './components/DocsPage.jsx';
import AboutPage from './components/AboutPage.jsx';
import Footer from './components/Footer.jsx';
import { fetchHealth } from './api.js';

function getInitialRoute() {
  const path = window.location.pathname;
  if (path === '/docs') return '/docs';
  if (path === '/about') return '/about';
  if (window.location.hash === '#docs') return '/docs';
  if (window.location.hash === '#about') return '/about';
  return '/';
}

export default function App() {
  const [route, setRoute] = useState(getInitialRoute);
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [activeDoc, setActiveDoc] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'connected', 'offline'

  useEffect(() => {
    let isMounted = true;
    fetchHealth()
      .then((res) => {
        if (isMounted) {
          setServerStatus(res.ok ? 'connected' : 'offline');
        }
      })
      .catch(() => {
        if (isMounted) {
          setServerStatus('offline');
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getInitialRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to) => {
    if (to !== route) {
      window.history.pushState({}, '', to);
      setRoute(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUploadSuccess = (data) => {
    setActiveDoc({
      filename: data.filename,
      pageCount: data.pageCount,
      chunkCount: data.chunkCount
    });
    // Ensure we are on the playground view
    navigate('/');
  };

  const handleResetSession = () => {
    setSessionId(`session_${Date.now()}`);
    setActiveDoc(null);
  };

  return (
    <div className="min-h-screen bg-[#0d0e11] text-[#f1f5f9] flex flex-col font-sans selection:bg-[#5b6cf0] selection:text-white">
      <Header 
        status={serverStatus} 
        currentRoute={route}
        onNavigate={navigate}
      />

      <main className="flex-1 flex flex-col">
        {route === '/docs' && (
          <DocsPage onNavigateToApp={() => navigate('/')} />
        )}

        {route === '/about' && (
          <AboutPage onNavigateToApp={() => navigate('/')} />
        )}

        {route === '/' && (
          !activeDoc ? (
            <div className="flex-1 flex flex-col justify-center pb-12">
              <Hero
                onUploadSuccess={handleUploadSuccess}
                sessionId={sessionId}
              />
              <HowItWorks />
            </div>
          ) : (
            <div className="flex-1">
              <AnswerCard
                sessionId={sessionId}
                activeDoc={activeDoc}
                onResetSession={handleResetSession}
              />
            </div>
          )
        )}
      </main>

      <Footer onNavigate={navigate} currentRoute={route} />
    </div>
  );
}
