import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const OnboardingTour = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);

  const steps = [
    {
      target: '.sidebar',
      title: '👋 Welcome to Chat App!',
      content: 'Click on any user to start chatting. Your conversations are organized here.',
      position: 'right'
    },
    {
      target: '.chat-header',
      title: '💬 Chat Features',
      content: 'Access search, pinned messages, and user info from the header.',
      position: 'bottom'
    },
    {
      target: '.message-input',
      title: '✍️ Send Messages',
      content: 'Type messages, send emojis, GIFs, voice notes, and more!',
      position: 'top'
    },
    {
      target: '.theme-button',
      title: '🎨 Customize',
      content: 'Change themes, enable dark mode, and personalize your experience.',
      position: 'bottom'
    },
    {
      target: '.profile-button',
      title: '👤 Your Profile',
      content: 'Update your profile, settings, and preferences here.',
      position: 'left'
    }
  ];

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenTour) {
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShow(false);
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShow(false);
  };

  if (!show) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[100] animate-in fade-in" />
      
      {/* Tour Card */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-base-100 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle"
        >
          <X size={18} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
          <p className="text-base-content/70">{step.content}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 flex-1 rounded-full transition-all ${
                idx === currentStep ? 'bg-primary' : idx < currentStep ? 'bg-primary/50' : 'bg-base-300'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="btn btn-ghost btn-sm"
          >
            Skip Tour
          </button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="btn btn-ghost btn-sm gap-1"
              >
                <ChevronLeft size={18} />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="btn btn-primary btn-sm gap-1"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight size={18} />}
            </button>
          </div>
        </div>

        {/* Step Counter */}
        <div className="text-center mt-4 text-sm text-base-content/60">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
