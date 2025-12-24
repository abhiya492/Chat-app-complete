import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Copy, Reply, MoreHorizontal } from "lucide-react";
import { useAccessibilityStore } from "../store/useAccessibilityStore";
import { useTextToSpeech } from "./TextToSpeechReader";
import { formatMessageTime } from "../lib/utils";

const AccessibleMessage = ({ 
  message, 
  isOwnMessage, 
  onReply, 
  onCopy, 
  showAvatar = true 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const messageRef = useRef(null);
  
  const { textToSpeech, visual, motor } = useAccessibilityStore();
  const { speak, stop } = useTextToSpeech();

  // Auto-read new messages if enabled
  useEffect(() => {
    if (textToSpeech.enabled && !isOwnMessage && message.text) {
      const timer = setTimeout(() => {
        handleSpeak();
      }, 500); // Small delay to avoid overwhelming
      
      return () => clearTimeout(timer);
    }
  }, [message.text, textToSpeech.enabled, isOwnMessage]);

  const handleSpeak = () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
      messageRef.current?.classList.remove('tts-speaking');
    } else {
      const textToRead = `${message.sender?.fullName || 'Unknown'} says: ${message.text}`;
      speak(textToRead);
      setIsPlaying(true);
      messageRef.current?.classList.add('tts-speaking');
      
      // Remove highlight after speaking
      setTimeout(() => {
        setIsPlaying(false);
        messageRef.current?.classList.remove('tts-speaking');
      }, textToRead.length * 100); // Approximate reading time
    }
  };

  const handleCopy = () => {
    onCopy?.(message.text);
    if (textToSpeech.enabled) {
      speak("Message copied");
    }
  };

  const handleReply = () => {
    onReply?.(message);
    if (textToSpeech.enabled) {
      speak("Replying to message");
    }
  };

  const messageClasses = `
    message-bubble p-3 rounded-lg max-w-xs break-words
    ${isOwnMessage ? 'bg-primary text-primary-content ml-auto' : 'bg-base-200'}
    ${visual.highContrast ? 'border-2 border-base-content' : ''}
    ${motor.largerClickTargets ? 'text-base p-4' : 'text-sm'}
    ${isPlaying ? 'tts-speaking' : ''}
    transition-all duration-200
  `;

  return (
    <div 
      className={`flex gap-3 mb-4 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onFocus={() => setShowActions(true)}
      onBlur={() => setShowActions(false)}
      tabIndex={0}
      role="article"
      aria-label={`Message from ${message.sender?.fullName || 'Unknown'} at ${formatMessageTime(message.createdAt)}`}
    >
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <div className="avatar">
          <div className="w-8 h-8 rounded-full">
            <img 
              src={message.sender?.profilePic || "/avatar.png"} 
              alt={`${message.sender?.fullName || 'User'} avatar`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="flex-1 max-w-xs">
        {/* Sender name for screen readers */}
        {!isOwnMessage && (
          <div className="sr-only">
            Message from {message.sender?.fullName || 'Unknown user'}
          </div>
        )}

        {/* Message content */}
        <div 
          ref={messageRef}
          className={messageClasses}
          role="text"
          aria-live="polite"
        >
          {/* Reply indicator */}
          {message.replyTo && (
            <div className="text-xs opacity-70 mb-2 p-2 bg-black/10 rounded">
              <div className="font-medium">Replying to:</div>
              <div className="truncate">{message.replyTo.text}</div>
            </div>
          )}

          {/* Message text */}
          <div className="message-text">
            {message.text}
          </div>

          {/* Image/Media */}
          {message.image && (
            <div className="mt-2">
              <img 
                src={message.image} 
                alt="Shared image"
                className="max-w-full rounded"
                loading="lazy"
              />
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs opacity-60 mt-1 ${isOwnMessage ? 'text-right' : ''}`}>
            <time dateTime={message.createdAt}>
              {formatMessageTime(message.createdAt)}
            </time>
          </div>
        </div>

        {/* Message Actions */}
        {(showActions || motor.largerClickTargets) && (
          <div className={`flex gap-1 mt-1 ${isOwnMessage ? 'justify-end' : ''}`}>
            {/* Text-to-Speech */}
            {textToSpeech.enabled && (
              <button
                onClick={handleSpeak}
                className="btn btn-ghost btn-xs"
                aria-label={isPlaying ? "Stop reading message" : "Read message aloud"}
                title={isPlaying ? "Stop reading" : "Read aloud"}
              >
                {isPlaying ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </button>
            )}

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="btn btn-ghost btn-xs"
              aria-label="Copy message"
              title="Copy message"
            >
              <Copy className="w-3 h-3" />
            </button>

            {/* Reply */}
            {!isOwnMessage && (
              <button
                onClick={handleReply}
                className="btn btn-ghost btn-xs"
                aria-label="Reply to message"
                title="Reply to message"
              >
                <Reply className="w-3 h-3" />
              </button>
            )}

            {/* More actions */}
            <button
              className="btn btn-ghost btn-xs"
              aria-label="More actions"
              title="More actions"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Own message avatar */}
      {showAvatar && isOwnMessage && (
        <div className="avatar">
          <div className="w-8 h-8 rounded-full">
            <img 
              src={message.sender?.profilePic || "/avatar.png"} 
              alt="Your avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibleMessage;