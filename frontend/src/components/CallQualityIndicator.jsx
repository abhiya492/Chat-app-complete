import { useState, useEffect } from 'react';
import { checkNetworkQuality, getQualityColor, getQualityIcon, getQualityMessage } from '../lib/networkQuality';
import { Wifi, WifiOff, AlertTriangle, Signal, Zap, Activity, TrendingUp, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CallQualityIndicator = ({ onProceed, onCancel }) => {
  const [quality, setQuality] = useState(null);
  const [details, setDetails] = useState({});
  const [checking, setChecking] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkQuality = async () => {
      setChecking(true);
      
      // Animated progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      const result = await checkNetworkQuality();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setQuality(result.quality);
        setDetails(result.details);
        setChecking(false);
      }, 300);
    };

    checkQuality();
  }, []);

  const getQualityGradient = () => {
    if (quality === 'good') return 'from-green-500 to-emerald-600';
    if (quality === 'fair') return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-600';
  };

  const getQualityIcon = () => {
    if (quality === 'good') return <CheckCircle2 className="size-16" />;
    if (quality === 'fair') return <AlertCircle className="size-16" />;
    return <XCircle className="size-16" />;
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-base-300/50 relative overflow-hidden"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse"></div>
          
          <div className="relative z-10">
            {checking ? (
              <div className="text-center">
                {/* Animated scanning effect */}
                <div className="relative mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="size-24 mx-auto"
                  >
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                  </motion.div>
                  <Signal className="size-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Analyzing Network
                </h3>
                <p className="text-sm text-base-content/60 mb-4">Testing connection quality...</p>
                
                {/* Progress bar */}
                <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                </div>
                <p className="text-xs text-base-content/50 mt-2">{progress}%</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Quality Icon with animation */}
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className={`inline-flex items-center justify-center size-24 rounded-full bg-gradient-to-br ${getQualityGradient()} text-white mb-4 shadow-lg`}
                  >
                    {getQualityIcon()}
                  </motion.div>
                  
                  <motion.h3 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-bold mb-2"
                  >
                    {quality === 'good' ? 'Excellent' : quality === 'fair' ? 'Fair' : 'Poor'} Connection
                  </motion.h3>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`text-sm font-medium ${
                      quality === 'good' ? 'text-success' : 
                      quality === 'fair' ? 'text-warning' : 'text-error'
                    }`}
                  >
                    {getQualityMessage(quality)}
                  </motion.p>
                </div>

                {/* Metrics Cards */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-2 gap-3 mb-6"
                >
                  {/* Latency Card */}
                  {details.latency && (
                    <div className="bg-gradient-to-br from-base-200 to-base-300 rounded-2xl p-4 border border-base-300/50 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="size-4 text-primary" />
                        <span className="text-xs font-medium text-base-content/60">Latency</span>
                      </div>
                      <div className="text-2xl font-bold">{details.latency}<span className="text-sm text-base-content/50">ms</span></div>
                      <div className="text-xs text-base-content/50 mt-1">
                        {details.latency < 50 ? 'Excellent' : details.latency < 150 ? 'Good' : details.latency < 300 ? 'Fair' : 'Poor'}
                      </div>
                    </div>
                  )}
                  
                  {/* Connection Type Card */}
                  {details.type && (
                    <div className="bg-gradient-to-br from-base-200 to-base-300 rounded-2xl p-4 border border-base-300/50 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Signal className="size-4 text-secondary" />
                        <span className="text-xs font-medium text-base-content/60">Type</span>
                      </div>
                      <div className="text-2xl font-bold uppercase">{details.type}</div>
                      <div className="text-xs text-base-content/50 mt-1">
                        {details.type === '4g' ? 'Fast' : details.type === '3g' ? 'Moderate' : 'Slow'}
                      </div>
                    </div>
                  )}
                  
                  {/* Speed Card */}
                  {details.downlink && (
                    <div className="bg-gradient-to-br from-base-200 to-base-300 rounded-2xl p-4 border border-base-300/50 shadow-sm col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="size-4 text-accent" />
                        <span className="text-xs font-medium text-base-content/60">Download Speed</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <div className="text-2xl font-bold">{details.downlink}</div>
                        <span className="text-sm text-base-content/50">Mbps</span>
                      </div>
                      {/* Speed bar */}
                      <div className="mt-2 w-full bg-base-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-accent to-primary transition-all"
                          style={{ width: `${Math.min((details.downlink / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* RTT Card */}
                  {details.rtt && (
                    <div className="bg-gradient-to-br from-base-200 to-base-300 rounded-2xl p-4 border border-base-300/50 shadow-sm col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="size-4 text-info" />
                        <span className="text-xs font-medium text-base-content/60">Round Trip Time</span>
                      </div>
                      <div className="text-2xl font-bold">{details.rtt}<span className="text-sm text-base-content/50">ms</span></div>
                    </div>
                  )}
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex gap-3"
                >
                  <button 
                    onClick={onCancel} 
                    className="btn btn-ghost flex-1 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={onProceed} 
                    className={`btn flex-1 rounded-xl shadow-lg ${
                      quality === 'poor' 
                        ? 'btn-warning hover:btn-error' 
                        : 'btn-primary bg-gradient-to-r from-primary to-secondary border-0 hover:scale-105 transition-transform'
                    }`}
                  >
                    {quality === 'poor' ? '⚠️ Call Anyway' : '📞 Start Call'}
                  </button>
                </motion.div>
                
                {/* Warning for poor quality */}
                {quality === 'poor' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 p-3 bg-error/10 border border-error/20 rounded-xl flex items-start gap-2"
                  >
                    <AlertTriangle className="size-5 text-error flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-error">
                      Your connection quality is poor. You may experience audio/video issues during the call.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallQualityIndicator;
