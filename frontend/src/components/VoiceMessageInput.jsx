import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { useAccessibilityStore } from "../store/useAccessibilityStore";

const VoiceMessageInput = ({ value, onChange, onSend, placeholder }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const { voiceToText } = useAccessibilityStore();

  useEffect(() => {
    if (!voiceToText.enabled || !('webkitSpeechRecognition' in window)) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = voiceToText.language;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onChange(value + finalTranscript + " ");
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    return () => {
      if (recognition) recognition.stop();
    };
  }, [voiceToText.enabled, voiceToText.language, value, onChange]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {voiceToText.enabled && (
        <button
          onClick={toggleListening}
          className={`btn btn-circle btn-sm ${isListening ? 'btn-error' : 'btn-ghost'}`}
          title={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      )}
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="textarea textarea-bordered flex-1 resize-none"
        rows={1}
        onKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      
      <button
        onClick={onSend}
        disabled={!value.trim()}
        className="btn btn-primary btn-circle btn-sm"
      >
        <Send className="w-4 h-4" />
      </button>
      
      {isListening && (
        <div className="absolute -top-8 left-0 text-xs text-primary flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Listening...
        </div>
      )}
    </div>
  );
};

export default VoiceMessageInput;