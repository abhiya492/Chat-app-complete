import { useEffect, useState } from 'react';
import { axiosInstance } from '../lib/axios';
import { Smile, Frown, Meh } from 'lucide-react';

const SentimentIndicator = ({ text }) => {
  const [sentiment, setSentiment] = useState(null);

  useEffect(() => {
    if (text) analyzeSentiment();
  }, [text]);

  const analyzeSentiment = async () => {
    try {
      const res = await axiosInstance.post('/ai/sentiment', { text });
      setSentiment(res.data);
    } catch (error) {
      console.error('Sentiment error:', error);
    }
  };

  if (!sentiment) return null;

  const Icon = sentiment.sentiment === 'positive' ? Smile : 
               sentiment.sentiment === 'negative' ? Frown : Meh;
  
  const color = sentiment.sentiment === 'positive' ? 'text-success' : 
                sentiment.sentiment === 'negative' ? 'text-error' : 'text-warning';

  return (
    <div className={`tooltip ${color}`} data-tip={`${sentiment.sentiment} (${Math.round(sentiment.score * 100)}%)`}>
      <Icon size={14} />
    </div>
  );
};

export default SentimentIndicator;
