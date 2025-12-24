import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Square } from "lucide-react";
import { useAccessibilityStore } from "../store/useAccessibilityStore";
import toast from "react-hot-toast";

const VoiceToTextInput = ({ onTranscript, placeholder = "Speak to type..." }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef(null);
  const { voiceToText } = useAccessibilityStore();

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    recognition.continuous = voiceToText.continuous;
    recognition.interimResults = true;
    recognition.lang = voiceToText.language;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        onTranscript?.(finalTranscript);
      }
      setInterimTranscript(interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied. Please allow microphone access.");
      } else if (event.error === 'no-speech') {
        toast.error("No speech detected. Please try again.");
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [voiceToText.language, voiceToText.continuous, onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Failed to start speech recognition");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
  };

  if (!voiceToText.enabled) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`btn btn-sm ${isListening ? 'btn-error' : 'btn-primary'}`}
          disabled={!voiceToText.enabled}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isListening ? 'Stop' : 'Start'} Listening
        </button>
        
        {transcript && (
          <button
            onClick={clearTranscript}
            className="btn btn-sm btn-ghost"
          >
            <Square className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {(transcript || interimTranscript) && (
        <div className="p-3 bg-base-300 rounded-lg">
          <div className="text-sm font-medium mb-2">Transcript:</div>
          <div className="text-sm">
            <span className="text-base-content">{transcript}</span>
            <span className="text-base-content/50 italic">{interimTranscript}</span>
          </div>
        </div>
      )}

      {isListening && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Listening... Speak now
        </div>
      )}

      <div className="text-xs text-base-content/70">
        Language: {voiceToText.language} | 
        Mode: {voiceToText.continuous ? 'Continuous' : 'Single'}
      </div>
    </div>
  );
};

export default VoiceToTextInput;