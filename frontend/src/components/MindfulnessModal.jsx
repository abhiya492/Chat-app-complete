import { useState, useEffect } from 'react';
import { useWellnessStore } from '../store/useWellnessStore';

const MindfulnessModal = () => {
  const { mindfulnessPrompt, getMindfulnessPrompt } = useWellnessStore();
  const [showModal, setShowModal] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);

  useEffect(() => {
    // Show mindfulness prompt randomly (10% chance every 5 minutes)
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        getMindfulnessPrompt();
        setShowModal(true);
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [getMindfulnessPrompt]);

  const startBreathing = () => {
    setBreathingActive(true);
    setTimeout(() => setBreathingActive(false), 30000); // 30 seconds
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 max-w-md mx-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4 text-primary">
            Mindful Moment 🧘‍♀️
          </h3>
          
          {!breathingActive ? (
            <>
              <p className="text-base-content/80 mb-6">
                {mindfulnessPrompt}
              </p>
              
              <div className="flex space-x-3 justify-center">
                <button 
                  onClick={startBreathing}
                  className="btn btn-primary"
                >
                  Breathing Exercise
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost"
                >
                  Continue Later
                </button>
              </div>
            </>
          ) : (
            <div className="py-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary animate-pulse"></div>
              </div>
              <p className="text-lg mb-2">Breathe in... Breathe out...</p>
              <p className="text-sm text-base-content/60">Follow the circle</p>
              
              <button 
                onClick={() => {
                  setBreathingActive(false);
                  setShowModal(false);
                }}
                className="btn btn-sm btn-ghost mt-4"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindfulnessModal;