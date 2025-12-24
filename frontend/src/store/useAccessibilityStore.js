import { create } from "zustand";

export const useAccessibilityStore = create((set, get) => ({
  // Voice-to-text settings
  voiceToText: {
    enabled: localStorage.getItem("accessibility-voice-to-text") === "true",
    language: localStorage.getItem("accessibility-voice-language") || "en-US",
    continuous: true,
  },
  
  // Text-to-speech settings
  textToSpeech: {
    enabled: localStorage.getItem("accessibility-text-to-speech") === "true",
    voice: localStorage.getItem("accessibility-tts-voice") || null,
    rate: parseFloat(localStorage.getItem("accessibility-tts-rate")) || 1,
    pitch: parseFloat(localStorage.getItem("accessibility-tts-pitch")) || 1,
    volume: parseFloat(localStorage.getItem("accessibility-tts-volume")) || 1,
  },
  
  // Visual accessibility
  visual: {
    dyslexiaFont: localStorage.getItem("accessibility-dyslexia-font") === "true",
    colorBlindMode: localStorage.getItem("accessibility-colorblind-mode") || "none",
    highContrast: localStorage.getItem("accessibility-high-contrast") === "true",
    fontSize: localStorage.getItem("accessibility-font-size") || "medium",
    reducedMotion: localStorage.getItem("accessibility-reduced-motion") === "true",
  },
  
  // Motor accessibility
  motor: {
    oneHandedMode: localStorage.getItem("accessibility-one-handed") === "true",
    largerClickTargets: localStorage.getItem("accessibility-large-targets") === "true",
    stickyKeys: localStorage.getItem("accessibility-sticky-keys") === "true",
  },
  
  // Sign language
  signLanguage: {
    enabled: localStorage.getItem("accessibility-sign-language") === "true",
    showVideo: false,
    recordingVideo: false,
  },

  // Actions
  setVoiceToText: (settings) => {
    const current = get().voiceToText;
    const newSettings = { ...current, ...settings };
    localStorage.setItem("accessibility-voice-to-text", newSettings.enabled);
    localStorage.setItem("accessibility-voice-language", newSettings.language);
    set({ voiceToText: newSettings });
  },

  setTextToSpeech: (settings) => {
    const current = get().textToSpeech;
    const newSettings = { ...current, ...settings };
    localStorage.setItem("accessibility-text-to-speech", newSettings.enabled);
    localStorage.setItem("accessibility-tts-voice", newSettings.voice || "");
    localStorage.setItem("accessibility-tts-rate", newSettings.rate);
    localStorage.setItem("accessibility-tts-pitch", newSettings.pitch);
    localStorage.setItem("accessibility-tts-volume", newSettings.volume);
    set({ textToSpeech: newSettings });
  },

  setVisual: (settings) => {
    const current = get().visual;
    const newSettings = { ...current, ...settings };
    localStorage.setItem("accessibility-dyslexia-font", newSettings.dyslexiaFont);
    localStorage.setItem("accessibility-colorblind-mode", newSettings.colorBlindMode);
    localStorage.setItem("accessibility-high-contrast", newSettings.highContrast);
    localStorage.setItem("accessibility-font-size", newSettings.fontSize);
    localStorage.setItem("accessibility-reduced-motion", newSettings.reducedMotion);
    set({ visual: newSettings });
  },

  setMotor: (settings) => {
    const current = get().motor;
    const newSettings = { ...current, ...settings };
    localStorage.setItem("accessibility-one-handed", newSettings.oneHandedMode);
    localStorage.setItem("accessibility-large-targets", newSettings.largerClickTargets);
    localStorage.setItem("accessibility-sticky-keys", newSettings.stickyKeys);
    set({ motor: newSettings });
  },

  setSignLanguage: (settings) => {
    const current = get().signLanguage;
    const newSettings = { ...current, ...settings };
    localStorage.setItem("accessibility-sign-language", newSettings.enabled ?? current.enabled);
    set({ signLanguage: newSettings });
  },
}));