import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

const RetryButton = ({ onRetry, text = "Retry" }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setIsRetrying(false), 500);
    }
  };

  return (
    <button
      onClick={handleRetry}
      disabled={isRetrying}
      className="btn btn-sm btn-ghost gap-2"
    >
      <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
      {isRetrying ? 'Retrying...' : text}
    </button>
  );
};

export default RetryButton;
