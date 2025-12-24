import { useState, useRef } from "react";
import { Send, Paperclip, Smile, Mic } from "lucide-react";
import { useAccessibilityStore } from "../store/useAccessibilityStore";
import { useTextToSpeech } from "./TextToSpeechReader";
import VoiceToTextInput from "./VoiceToTextInput";
import EmojiPicker from "./EmojiPicker";

const AccessibleMessageInput = ({ onSendMessage, placeholder = "Type a message..." }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const textareaRef = useRef(null);
  
  const { voiceToText, textToSpeech, motor } = useAccessibilityStore();
  const { speak } = useTextToSpeech();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      
      // Announce message sent for screen readers
      if (textToSpeech.enabled) {
        speak("Message sent");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setMessage(prev => prev + transcript + " ");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="space-y-2">
      {/* Voice Input Panel */}
      {showVoiceInput && voiceToText.enabled && (
        <div className="p-3 bg-base-200 rounded-lg">
          <VoiceToTextInput onTranscript={handleVoiceTranscript} />
        </div>
      )}

      {/* Main Input Area */}
      <div className={`flex items-end gap-2 p-3 bg-base-200 rounded-lg ${motor.largerClickTargets ? 'large-targets' : ''}`}>
        {/* Voice Input Toggle */}
        {voiceToText.enabled && (
          <button
            onClick={() => setShowVoiceInput(!showVoiceInput)}
            className={`btn btn-ghost btn-sm ${showVoiceInput ? 'btn-active' : ''}`}
            aria-label="Toggle voice input"
            title="Voice to text"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}

        {/* File Attachment */}
        <button
          className="btn btn-ghost btn-sm"
          aria-label="Attach file"
          title="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="textarea textarea-bordered w-full resize-none min-h-[2.5rem] max-h-32"
            rows={1}
            aria-label="Message input"
            style={{
              fontSize: motor.largerClickTargets ? '16px' : '14px',
              minHeight: motor.largerClickTargets ? '48px' : '40px'
            }}
          />
          
          {/* Character count for accessibility */}
          <div className="sr-only" aria-live="polite">
            {message.length} characters typed
          </div>
        </div>

        {/* Emoji Picker */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="btn btn-ghost btn-sm"
            aria-label="Add emoji"
            title="Add emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-10">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="btn btn-primary btn-sm"
          aria-label="Send message"
          title="Send message"
          style={{
            minHeight: motor.largerClickTargets ? '48px' : '36px',
            minWidth: motor.largerClickTargets ? '48px' : '36px'
          }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-base-content/60">
        <span className="sr-only">Keyboard shortcuts: </span>
        Press Enter to send, Shift+Enter for new line
        {voiceToText.enabled && ", or use voice input"}
      </div>
    </div>
  );
};

export default AccessibleMessageInput;