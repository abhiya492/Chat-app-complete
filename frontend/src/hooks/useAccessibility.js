import { useEffect, useState } from "react";
import { useAccessibilityStore } from "../store/useAccessibilityStore";

export const useAccessibilityKeyboard = () => {
  const [stickyKeys, setStickyKeys] = useState({
    ctrl: false,
    alt: false,
    shift: false,
    meta: false
  });
  
  const { motor } = useAccessibilityStore();

  useEffect(() => {
    if (!motor.stickyKeys) return;

    const handleKeyDown = (event) => {
      // Handle sticky keys
      if (event.key === 'Control') {
        setStickyKeys(prev => ({ ...prev, ctrl: !prev.ctrl }));
        event.preventDefault();
      } else if (event.key === 'Alt') {
        setStickyKeys(prev => ({ ...prev, alt: !prev.alt }));
        event.preventDefault();
      } else if (event.key === 'Shift') {
        setStickyKeys(prev => ({ ...prev, shift: !prev.shift }));
        event.preventDefault();
      } else if (event.key === 'Meta') {
        setStickyKeys(prev => ({ ...prev, meta: !prev.meta }));
        event.preventDefault();
      }

      // Apply sticky modifiers to other keys
      if (stickyKeys.ctrl) event.ctrlKey = true;
      if (stickyKeys.alt) event.altKey = true;
      if (stickyKeys.shift) event.shiftKey = true;
      if (stickyKeys.meta) event.metaKey = true;
    };

    const handleKeyUp = (event) => {
      // Reset sticky keys on regular key press
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
        setStickyKeys({ ctrl: false, alt: false, shift: false, meta: false });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [motor.stickyKeys, stickyKeys]);

  // Keyboard shortcuts for accessibility
  useEffect(() => {
    const handleGlobalKeyboard = (event) => {
      // Alt + A: Open accessibility panel
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        // Trigger accessibility panel open
        const accessibilityButton = document.querySelector('[aria-label="Open accessibility settings"]');
        accessibilityButton?.click();
      }

      // Alt + V: Toggle voice input
      if (event.altKey && event.key === 'v') {
        event.preventDefault();
        const voiceButton = document.querySelector('[aria-label="Toggle voice input"]');
        voiceButton?.click();
      }

      // Alt + R: Read current message
      if (event.altKey && event.key === 'r') {
        event.preventDefault();
        const readButton = document.querySelector('[aria-label="Read message aloud"]');
        readButton?.click();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyboard);
    return () => document.removeEventListener('keydown', handleGlobalKeyboard);
  }, []);

  return {
    stickyKeys,
    isStickyKeysActive: Object.values(stickyKeys).some(Boolean)
  };
};

export const useAccessibilityFocus = () => {
  useEffect(() => {
    // Enhanced focus management
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const handleFocusTrapping = (event) => {
      const modal = event.target.closest('[role="dialog"]');
      if (!modal) return;

      const focusable = modal.querySelectorAll(focusableElements);
      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
          }
        }
      }

      // Escape to close modal
      if (event.key === 'Escape') {
        const closeButton = modal.querySelector('[aria-label*="Close"], [aria-label*="close"]');
        closeButton?.click();
      }
    };

    document.addEventListener('keydown', handleFocusTrapping);
    return () => document.removeEventListener('keydown', handleFocusTrapping);
  }, []);
};

export const useAccessibilityAnnouncements = () => {
  const [announcement, setAnnouncement] = useState("");

  const announce = (message, priority = "polite") => {
    setAnnouncement("");
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);
  };

  return {
    announcement,
    announce,
    AnnouncementRegion: () => (
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    )
  };
};