import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

const ColdStartLoader = ({ onReady }) => {
  const [status, setStatus] = useState('checking');
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30;

    const checkBackend = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          setStatus('ready');
          setTimeout(() => onReady(), 500);
          return;
        }
      } catch (error) {
        console.log('Backend not ready, retrying...');
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkBackend, 2000);
      } else {
        setStatus('error');
      }
    };

    checkBackend();
  }, [onReady]);

  if (status === 'ready') return null;

  return (
    <div className="fixed inset-0 bg-base-100 flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <Loader className="w-12 h-12 animate-spin mx-auto text-primary" />
        {status === 'checking' && (
          <>
            <p className="text-lg font-medium">Waking up server{dots}</p>
            <p className="text-sm text-base-content/60">First load may take 30-50 seconds</p>
            <p className="text-xs text-base-content/40 mt-2">Free tier limitation</p>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-lg font-medium text-error">Connection timeout</p>
            <p className="text-sm">Please refresh the page</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary btn-sm mt-4"
            >
              Refresh
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ColdStartLoader;
