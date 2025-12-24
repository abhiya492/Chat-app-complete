import { useState, useEffect } from "react";
import { useAccessibilityStore } from "../store/useAccessibilityStore";
import { Mic, MicOff, Volume2, VolumeX, Eye, Hand, Type, Palette, Settings } from "lucide-react";
import VoiceToTextInput from "./VoiceToTextInput";
import TextToSpeechReader from "./TextToSpeechReader";
import SignLanguageVideo from "./SignLanguageVideo";

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("voice");
  
  const {
    voiceToText,
    textToSpeech,
    visual,
    motor,
    signLanguage,
    setVoiceToText,
    setTextToSpeech,
    setVisual,
    setMotor,
    setSignLanguage,
  } = useAccessibilityStore();

  // Apply accessibility styles to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Dyslexia-friendly font
    if (visual.dyslexiaFont) {
      root.style.setProperty("--font-family", "OpenDyslexic, Arial, sans-serif");
    } else {
      root.style.removeProperty("--font-family");
    }
    
    // Font size
    const fontSizes = { small: "14px", medium: "16px", large: "18px", xlarge: "20px" };
    root.style.setProperty("--base-font-size", fontSizes[visual.fontSize]);
    
    // High contrast
    if (visual.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    
    // Reduced motion
    if (visual.reducedMotion) {
      root.style.setProperty("--animation-duration", "0s");
    } else {
      root.style.removeProperty("--animation-duration");
    }
    
    // One-handed mode
    if (motor.oneHandedMode) {
      root.classList.add("one-handed-mode");
    } else {
      root.classList.remove("one-handed-mode");
    }
    
    // Larger click targets
    if (motor.largerClickTargets) {
      root.classList.add("large-targets");
    } else {
      root.classList.remove("large-targets");
    }
    
    // Color blind mode
    if (visual.colorBlindMode !== "none") {
      root.classList.add(`colorblind-${visual.colorBlindMode}`);
    } else {
      root.className = root.className.replace(/colorblind-\w+/g, "");
    }
  }, [visual, motor]);

  const tabs = [
    { id: "voice", label: "Voice", icon: Mic },
    { id: "visual", label: "Visual", icon: Eye },
    { id: "motor", label: "Motor", icon: Hand },
    { id: "sign", label: "Sign Language", icon: Hand },
  ];

  return (
    <>
      {/* Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 btn btn-circle btn-primary"
        aria-label="Open accessibility settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Accessibility Panel Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-base-100 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold">Accessibility Settings</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-sm"
                  aria-label="Close accessibility settings"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 bg-base-200 p-4">
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            activeTab === tab.id
                              ? "bg-primary text-primary-content"
                              : "hover:bg-base-300"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {activeTab === "voice" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Voice & Audio</h3>
                      
                      {/* Voice to Text */}
                      <div className="card bg-base-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Mic className="w-5 h-5" />
                            <span className="font-medium">Voice to Text</span>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={voiceToText.enabled}
                            onChange={(e) => setVoiceToText({ enabled: e.target.checked })}
                          />
                        </div>
                        {voiceToText.enabled && (
                          <div className="space-y-3">
                            <select
                              className="select select-bordered w-full"
                              value={voiceToText.language}
                              onChange={(e) => setVoiceToText({ language: e.target.value })}
                            >
                              <option value="en-US">English (US)</option>
                              <option value="en-GB">English (UK)</option>
                              <option value="es-ES">Spanish</option>
                              <option value="fr-FR">French</option>
                              <option value="de-DE">German</option>
                            </select>
                            <VoiceToTextInput />
                          </div>
                        )}
                      </div>

                      {/* Text to Speech */}
                      <div className="card bg-base-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Volume2 className="w-5 h-5" />
                            <span className="font-medium">Text to Speech</span>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={textToSpeech.enabled}
                            onChange={(e) => setTextToSpeech({ enabled: e.target.checked })}
                          />
                        </div>
                        {textToSpeech.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="label">Speech Rate</label>
                              <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={textToSpeech.rate}
                                onChange={(e) => setTextToSpeech({ rate: parseFloat(e.target.value) })}
                                className="range range-primary"
                              />
                              <div className="text-sm text-base-content/70">{textToSpeech.rate}x</div>
                            </div>
                            <div>
                              <label className="label">Volume</label>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={textToSpeech.volume}
                                onChange={(e) => setTextToSpeech({ volume: parseFloat(e.target.value) })}
                                className="range range-primary"
                              />
                            </div>
                            <TextToSpeechReader />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "visual" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Visual Accessibility</h3>
                      
                      {/* Dyslexia Font */}
                      <div className="card bg-base-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Type className="w-5 h-5" />
                            <span className="font-medium">Dyslexia-Friendly Font</span>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={visual.dyslexiaFont}
                            onChange={(e) => setVisual({ dyslexiaFont: e.target.checked })}
                          />
                        </div>
                      </div>

                      {/* Font Size */}
                      <div className="card bg-base-200 p-4">
                        <label className="label">Font Size</label>
                        <select
                          className="select select-bordered w-full"
                          value={visual.fontSize}
                          onChange={(e) => setVisual({ fontSize: e.target.value })}
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="xlarge">Extra Large</option>
                        </select>
                      </div>

                      {/* Color Blind Support */}
                      <div className="card bg-base-200 p-4">
                        <label className="label">Color Blind Support</label>
                        <select
                          className="select select-bordered w-full"
                          value={visual.colorBlindMode}
                          onChange={(e) => setVisual({ colorBlindMode: e.target.value })}
                        >
                          <option value="none">None</option>
                          <option value="protanopia">Protanopia (Red-blind)</option>
                          <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                          <option value="tritanopia">Tritanopia (Blue-blind)</option>
                        </select>
                      </div>

                      {/* High Contrast */}
                      <div className="card bg-base-200 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">High Contrast Mode</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={visual.highContrast}
                            onChange={(e) => setVisual({ highContrast: e.target.checked })}
                          />
                        </div>
                      </div>

                      {/* Reduced Motion */}
                      <div className="card bg-base-200 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Reduce Motion</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={visual.reducedMotion}
                            onChange={(e) => setVisual({ reducedMotion: e.target.checked })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "motor" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Motor Accessibility</h3>
                      
                      {/* One-Handed Mode */}
                      <div className="card bg-base-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">One-Handed Mode</span>
                            <p className="text-sm text-base-content/70">Moves controls to one side</p>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={motor.oneHandedMode}
                            onChange={(e) => setMotor({ oneHandedMode: e.target.checked })}
                          />
                        </div>
                      </div>

                      {/* Larger Click Targets */}
                      <div className="card bg-base-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">Larger Click Targets</span>
                            <p className="text-sm text-base-content/70">Makes buttons and links bigger</p>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={motor.largerClickTargets}
                            onChange={(e) => setMotor({ largerClickTargets: e.target.checked })}
                          />
                        </div>
                      </div>

                      {/* Sticky Keys */}
                      <div className="card bg-base-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">Sticky Keys</span>
                            <p className="text-sm text-base-content/70">Hold modifier keys without pressing</p>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={motor.stickyKeys}
                            onChange={(e) => setMotor({ stickyKeys: e.target.checked })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "sign" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Sign Language</h3>
                      
                      <div className="card bg-base-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-medium">Enable Sign Language Video</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={signLanguage.enabled}
                            onChange={(e) => setSignLanguage({ enabled: e.target.checked })}
                          />
                        </div>
                        {signLanguage.enabled && <SignLanguageVideo />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityPanel;