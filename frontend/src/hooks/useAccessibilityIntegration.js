import { useEffect } from "react";
import { useAccessibilityStore } from "../store/useAccessibilityStore";

// Minimal accessibility integration - no UI conflicts
export const useAccessibilityIntegration = () => {
  const { visual, motor, textToSpeech } = useAccessibilityStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply visual accessibility
    if (visual.dyslexiaFont) root.classList.add('dyslexia-font');
    else root.classList.remove('dyslexia-font');
    
    if (visual.highContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');
    
    if (motor.oneHandedMode) root.classList.add('one-handed-mode');
    else root.classList.remove('one-handed-mode');
    
    if (motor.largerClickTargets) root.classList.add('large-targets');
    else root.classList.remove('large-targets');
    
    // Color blind support
    root.className = root.className.replace(/colorblind-\w+/g, "");
    if (visual.colorBlindMode !== "none") {
      root.classList.add(`colorblind-${visual.colorBlindMode}`);
    }
    
    // Font size
    const fontSizes = { small: "14px", medium: "16px", large: "18px", xlarge: "20px" };
    root.style.setProperty("--base-font-size", fontSizes[visual.fontSize]);
    
    // Reduced motion
    if (visual.reducedMotion) {
      root.style.setProperty("--animation-duration", "0s");
    } else {
      root.style.removeProperty("--animation-duration");
    }
  }, [visual, motor]);

  // Auto-read messages if TTS enabled
  useEffect(() => {
    if (!textToSpeech.enabled) return;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList?.contains('message-bubble')) {
            const text = node.textContent;
            if (text && !node.dataset.isOwnMessage) {
              setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = textToSpeech.rate;
                utterance.volume = textToSpeech.volume;
                speechSynthesis.speak(utterance);
              }, 500);
            }
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [textToSpeech]);
};