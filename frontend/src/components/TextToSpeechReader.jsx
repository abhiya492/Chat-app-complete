import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { useAccessibilityStore } from "../store/useAccessibilityStore";
import toast from "react-hot-toast";

const TextToSpeechReader = ({ text, autoRead = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const utteranceRef = useRef(null);
  const { textToSpeech, setTextToSpeech } = useAccessibilityStore();

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Set default voice if none selected
      if (!textToSpeech.voice && voices.length > 0) {
        const defaultVoice = voices.find(voice => voice.default) || voices[0];
        setTextToSpeech({ voice: defaultVoice.name });
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      if (utteranceRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [textToSpeech.voice, setTextToSpeech]);

  useEffect(() => {
    if (autoRead && text && textToSpeech.enabled) {
      speak(text);
    }
  }, [text, autoRead, textToSpeech.enabled]);

  const speak = (textToSpeak) => {
    if (!textToSpeech.enabled) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    if (!textToSpeak?.trim()) {
      toast.error("No text to read");
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utteranceRef.current = utterance;

      // Find selected voice
      const selectedVoice = availableVoices.find(voice => voice.name === textToSpeech.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = textToSpeech.rate;
      utterance.pitch = textToSpeech.pitch;
      utterance.volume = textToSpeech.volume;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        setIsPlaying(false);
        setIsPaused(false);
        toast.error("Text-to-speech error occurred");
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error creating speech utterance:", error);
      toast.error("Failed to start text-to-speech");
    }
  };

  const pause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!textToSpeech.enabled) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Voice Selection */}
      <div>
        <label className="label">Voice</label>
        <select
          className="select select-bordered w-full"
          value={textToSpeech.voice || ""}
          onChange={(e) => setTextToSpeech({ voice: e.target.value })}
        >
          <option value="">Default Voice</option>
          {availableVoices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Test Text Input */}
      <div>
        <label className="label">Test Text</label>
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Enter text to test speech..."
          rows={3}
          id="tts-test-text"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            const testText = document.getElementById('tts-test-text')?.value || "Hello, this is a test of the text to speech feature.";
            speak(testText);
          }}
          className="btn btn-sm btn-primary"
          disabled={isPlaying && !isPaused}
        >
          <Play className="w-4 h-4" />
          Speak
        </button>

        {isPlaying && !isPaused && (
          <button
            onClick={pause}
            className="btn btn-sm btn-warning"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}

        {isPaused && (
          <button
            onClick={resume}
            className="btn btn-sm btn-success"
          >
            <Play className="w-4 h-4" />
            Resume
          </button>
        )}

        {isPlaying && (
          <button
            onClick={stop}
            className="btn btn-sm btn-error"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        )}
      </div>

      {/* Settings Display */}
      <div className="text-xs text-base-content/70 space-y-1">
        <div>Rate: {textToSpeech.rate}x | Pitch: {textToSpeech.pitch} | Volume: {Math.round(textToSpeech.volume * 100)}%</div>
        <div>Voice: {textToSpeech.voice || "Default"}</div>
      </div>

      {isPlaying && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Volume2 className="w-4 h-4" />
          {isPaused ? "Paused" : "Speaking..."}
        </div>
      )}
    </div>
  );
};

// Hook for easy text-to-speech integration
export const useTextToSpeech = () => {
  const { textToSpeech } = useAccessibilityStore();

  const speak = (text) => {
    if (!textToSpeech.enabled || !text?.trim()) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = textToSpeech.rate;
    utterance.pitch = textToSpeech.pitch;
    utterance.volume = textToSpeech.volume;

    if (textToSpeech.voice) {
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name === textToSpeech.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    speechSynthesis.cancel();
  };

  return { speak, stop, enabled: textToSpeech.enabled };
};

export default TextToSpeechReader;