import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { fetchHealth } from '../api.js';

export default function HealthBanner() {
  const [status, setStatus] = useState('checking');
  
  useEffect(() => {
    let isMounted = true;
    let attempts = 0;

    const checkHealth = async () => {
      try {
        const res = await fetchHealth();
        if (res.ok) {
          if (isMounted) setStatus('ready');
        } else {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
      } catch (err) {
        attempts++;
        if (isMounted) {
          if (attempts > 1) {
            setStatus('cold_start');
          }
          setTimeout(checkHealth, 3000);
        }
      }
    };

    checkHealth();
    return () => { isMounted = false; };
  }, []);

  if (status === 'ready') return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between text-xs font-medium text-amber-300">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>
            {status === 'cold_start'
              ? 'Waking up backend server (Render free-tier cold start in progress, please wait ~15-30s)...'
              : 'Connecting to Lumen API backend...'}
          </span>
        </div>
      </div>
    </div>
  );
}
