import { useState } from "react";
import { useAccessibilityStore } from "../store/useAccessibilityStore";
import { Eye, Mic, Volume2, Hand } from "lucide-react";

const AccessibilityToggle = () => {
  const {
    voiceToText,
    textToSpeech,
    visual,
    motor,
    setVoiceToText,
    setTextToSpeech,
    setVisual,
    setMotor,
  } = useAccessibilityStore();

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
        <Eye className="w-4 h-4" />
      </div>
      
      <div className="dropdown-content z-[60] menu p-3 shadow bg-base-100 rounded-box w-72 mt-2">
        <div className="mb-3">
          <span className="font-medium text-sm">Accessibility Options</span>
        </div>
        
        {/* Voice to Text */}
        <label className="label cursor-pointer py-1">
          <span className="label-text flex items-center gap-2 text-xs">
            <Mic className="w-3 h-3" />
            Voice Input
          </span>
          <input
            type="checkbox"
            className="toggle toggle-xs"
            checked={voiceToText.enabled}
            onChange={(e) => setVoiceToText({ enabled: e.target.checked })}
          />
        </label>

        {/* Text to Speech */}
        <label className="label cursor-pointer py-1">
          <span className="label-text flex items-center gap-2 text-xs">
            <Volume2 className="w-3 h-3" />
            Read Messages
          </span>
          <input
            type="checkbox"
            className="toggle toggle-xs"
            checked={textToSpeech.enabled}
            onChange={(e) => setTextToSpeech({ enabled: e.target.checked })}
          />
        </label>

        {/* Dyslexia Font */}
        <label className="label cursor-pointer py-1">
          <span className="label-text text-xs">Dyslexia Font</span>
          <input
            type="checkbox"
            className="toggle toggle-xs"
            checked={visual.dyslexiaFont}
            onChange={(e) => setVisual({ dyslexiaFont: e.target.checked })}
          />
        </label>

        {/* High Contrast */}
        <label className="label cursor-pointer py-1">
          <span className="label-text text-xs">High Contrast</span>
          <input
            type="checkbox"
            className="toggle toggle-xs"
            checked={visual.highContrast}
            onChange={(e) => setVisual({ highContrast: e.target.checked })}
          />
        </label>

        {/* One-Handed Mode */}
        <label className="label cursor-pointer py-1">
          <span className="label-text flex items-center gap-2 text-xs">
            <Hand className="w-3 h-3" />
            One-Handed
          </span>
          <input
            type="checkbox"
            className="toggle toggle-xs"
            checked={motor.oneHandedMode}
            onChange={(e) => setMotor({ oneHandedMode: e.target.checked })}
          />
        </label>

        {/* Font Size */}
        <div className="form-control mt-2">
          <label className="label py-1">
            <span className="label-text text-xs">Font Size</span>
          </label>
          <select
            className="select select-bordered select-xs text-xs"
            value={visual.fontSize}
            onChange={(e) => setVisual({ fontSize: e.target.value })}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xlarge">X-Large</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityToggle;