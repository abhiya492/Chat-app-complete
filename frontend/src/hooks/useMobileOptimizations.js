import { useState, useEffect } from 'react';

export const useMobileOptimizations = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Detect keyboard on mobile
    const checkKeyboard = () => {
      if (isMobile) {
        const initialHeight = window.innerHeight;
        const currentHeight = window.visualViewport?.height || window.innerHeight;
        setIsKeyboardOpen(initialHeight - currentHeight > 150);
      }
    };

    // Detect orientation
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkMobile();
    checkKeyboard();
    checkOrientation();

    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', checkKeyboard);
    window.addEventListener('orientationchange', checkOrientation);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkKeyboard);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', checkKeyboard);
      window.removeEventListener('orientationchange', checkOrientation);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', checkKeyboard);
      }
    };
  }, [isMobile]);

  // Prevent zoom on input focus (iOS)
  useEffect(() => {
    if (isMobile) {
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          if (input.style.fontSize !== '16px') {
            input.style.fontSize = '16px';
          }
        });
      });
    }
  }, [isMobile]);

  return {
    isMobile,
    isKeyboardOpen,
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  };
};