import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

const WellnessInsights = () => {
  const [insights, setInsights] = useState(null);
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    fetchInsights();
  }, [timeframe]);

  const fetchInsights = async () => {
    try {
      const res = await axiosInstance.get(`/wellness/insights?timeframe=${timeframe}`);
      setInsights(res.data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    }
  };

  if (!insights) return <div className="loading loading-spinner"></div>;

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title">Wellness Insights 📊</h3>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="select select-sm select-bordered"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-title text-xs">Mood Trend</div>
            <div className={`stat-value text-lg ${insights.moodTrend > 0 ? 'text-success' : 'text-warning'}`}>
              {insights.moodTrend > 0 ? '📈' : '📉'} {Math.abs(insights.moodTrend).toFixed(1)}%
            </div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-title text-xs">Stress Pattern</div>
            <div className={`stat-value text-lg ${insights.avgStress < 30 ? 'text-success' : 'text-error'}`}>
              {insights.avgStress < 30 ? '😌' : '😰'} {insights.avgStress.toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="alert alert-info">
            <span className="text-sm">💡 {insights.recommendation}</span>
          </div>
          
          {insights.achievements.length > 0 && (
            <div className="alert alert-success">
              <span className="text-sm">🏆 {insights.achievements[0]}</span>
            </div>
          )}
          
          <div className="text-xs text-base-content/60">
            Best time for conversations: {insights.optimalChatTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessInsights;