import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useWellnessStore } from "../store/useWellnessStore";
import { useCircadianStore } from "../store/useCircadianStore";
import { useAccessibilityStore } from "../store/useAccessibilityStore";
import { encryptMessage, isEncryptionEnabled } from "../lib/e2eEncryption";
import { Image, Send, X, Paperclip, Mic, Video, Timer, Edit2, Loader2, Clock, MicOff, Shield } from "lucide-react";
import toast from "react-hot-toast";
import VoiceRecorder from "./VoiceRecorder";
import SmartReplies from "./SmartReplies";
import { motion } from "framer-motion";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [voiceData, setVoiceData] = useState(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [disappearAfter, setDisappearAfter] = useState(null);
  const [scheduledFor, setScheduledFor] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const docInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recognitionRef = useRef(null);
  const { sendMessage, replyingTo, setReplyingTo, editingMessage, setEditingMessage, emitTyping, emitStopTyping, messages, isSendingMessage, selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const { analyzeMoodFromText, updateTypingData } = useWellnessStore();
  const { shouldShowFeature } = useCircadianStore();
  const { voiceToText } = useAccessibilityStore();
  
  const lastReceivedMessage = messages.filter(m => m.senderId !== authUser._id).slice(-1)[0];

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || "");
    }
  }, [editingMessage]);

  // Voice-to-text setup
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
        setText(prev => prev + finalTranscript + " ");
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice recognition error");
    };

    return () => {
      if (recognition) recognition.stop();
    };
  }, [voiceToText.enabled, voiceToText.language]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview({
        data: reader.result,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video size must be less than 50MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview({
        data: reader.result,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video size must be less than 50MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setVideoPreview({ data: reader.result, name: file.name });
      reader.readAsDataURL(file);
    } else {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview({
          data: reader.result,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = () => {
    setFilePreview(null);
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const removeVideo = () => {
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    
    // Only track typing patterns if circadian wellness allows it
    if (shouldShowFeature('typing_analysis')) {
      const now = Date.now();
      const typingSpeed = e.target.value.length / ((now - (window.lastTypingTime || now)) / 1000) || 0;
      window.lastTypingTime = now;
      
      updateTypingData({
        speed: typingSpeed,
        errors: 0,
        pauses: 0
      });
    }
    
    emitTyping();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !filePreview && !videoPreview && !voiceData) return;

    if (scheduledFor && new Date(scheduledFor) <= new Date()) {
      toast.error("Scheduled time must be in the future");
      return;
    }

    try {
      if (editingMessage) {
        await useChatStore.getState().editMessage(editingMessage._id, text.trim(), isEncrypted);
      } else {
        // Analyze mood from message text
        if (text.trim()) {
          analyzeMoodFromText(text.trim());
          
          // Trigger music suggestion for strong emotional content
          const emotionalWords = ['love', 'hate', 'amazing', 'terrible', 'excited', 'sad', 'angry', 'happy'];
          const hasStrongEmotion = emotionalWords.some(word => 
            text.toLowerCase().includes(word)
          );
          
          if (hasStrongEmotion) {
            console.log('Strong emotion detected in message');
          }
        }
        
        // Prepare message data
        let messageData = {
          text: text.trim(),
          image: imagePreview,
          file: filePreview,
          video: videoPreview,
          voice: voiceData,
          disappearAfter,
          scheduledFor: scheduledFor || null,
          isEncrypted: false
        };
        
        // Encrypt message if encryption is enabled and recipient has public key
        if (isEncrypted && isEncryptionEnabled() && selectedUser?.publicKey && text.trim()) {
          const encryptionResult = encryptMessage(text.trim(), selectedUser.publicKey);
          if (encryptionResult.success) {
            messageData.text = encryptionResult.encrypted;
            messageData.isEncrypted = true;
          } else {
            toast.error('Encryption failed, sending unencrypted');
          }
        }
        
        await sendMessage(messageData);
        if (scheduledFor) {
          toast.success(`Message scheduled for ${new Date(scheduledFor).toLocaleString()}`);
        }
      }

      emitStopTyping();
      setText("");
      setImagePreview(null);
      setVideoPreview(null);
      setFilePreview(null);
      setVoiceData(null);
      setDisappearAfter(null);
      setScheduledFor("");
      setShowSchedule(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (docInputRef.current) docInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div 
      className="p-2 sm:p-4 w-full relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
          <p className="text-lg font-semibold">Drop file here</p>
        </div>
      )}
      {replyingTo && (
        <div className="mb-2 p-2 sm:p-3 bg-base-200 rounded-lg flex items-center justify-between border-l-4 border-primary animate-in slide-in-from-bottom-2 duration-200">
          <div className="text-xs sm:text-sm flex-1 min-w-0">
            <span className="font-semibold text-primary">Replying to</span>
            <p className="text-base-content/70 mt-1 truncate">{replyingTo.text?.substring(0, 30)}{replyingTo.text?.length > 30 ? '...' : ''}</p>
          </div>
          <button onClick={() => setReplyingTo(null)} className="btn btn-ghost btn-xs sm:btn-sm btn-circle flex-shrink-0">
            <X className="size-3 sm:size-4" />
          </button>
        </div>
      )}
      
      {editingMessage && (
        <div className="mb-2 p-2 sm:p-3 bg-warning/10 rounded-lg flex items-center justify-between border-l-4 border-warning animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2">
            <Edit2 className="size-3 sm:size-4 text-warning" />
            <span className="text-xs sm:text-sm font-semibold">Editing message</span>
          </div>
          <button onClick={() => { setEditingMessage(null); setText(""); }} className="btn btn-ghost btn-xs sm:btn-sm btn-circle">
            <X className="size-3 sm:size-4" />
          </button>
        </div>
      )}

      {imagePreview && (
        <div className="mb-2 sm:mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-base-300 shadow-md"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-error text-error-content hover:scale-110 transition-transform flex items-center justify-center shadow-lg"
              type="button"
            >
              <X className="size-2.5 sm:size-3" />
            </button>
          </div>
        </div>
      )}

      {videoPreview && (
        <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-base-200 rounded-lg flex items-center justify-between border border-base-300 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Video className="size-3 sm:size-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{videoPreview.name}</span>
          </div>
          <button onClick={removeVideo} className="btn btn-ghost btn-xs sm:btn-sm btn-circle flex-shrink-0">
            <X className="size-3 sm:size-4" />
          </button>
        </div>
      )}

      {filePreview && (
        <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-base-200 rounded-lg flex items-center justify-between border border-base-300 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Paperclip className="size-3 sm:size-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{filePreview.name}</span>
          </div>
          <button onClick={removeFile} className="btn btn-ghost btn-xs sm:btn-sm btn-circle flex-shrink-0">
            <X className="size-3 sm:size-4" />
          </button>
        </div>
      )}

      {voiceData && (
        <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-base-200 rounded-lg flex items-center justify-between border border-base-300 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2">
            <Mic className="size-3 sm:size-4" />
            <span className="text-xs sm:text-sm">Voice message ({voiceData.duration}s)</span>
          </div>
          <button onClick={() => setVoiceData(null)} className="btn btn-ghost btn-xs sm:btn-sm btn-circle">
            <X className="size-3 sm:size-4" />
          </button>
        </div>
      )}

      {showVoiceRecorder && (
        <VoiceRecorder
          onRecordingComplete={(data) => {
            setVoiceData(data);
            setShowVoiceRecorder(false);
          }}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}

      <SmartReplies 
        lastMessage={lastReceivedMessage} 
        onSelectReply={(reply) => setText(reply)}
      />

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Timer size={14} className="sm:w-4 sm:h-4 text-base-content/60" />
          <select 
            value={disappearAfter || ""} 
            onChange={(e) => setDisappearAfter(e.target.value ? parseInt(e.target.value) : null)}
            className="select select-xs sm:select-sm select-bordered text-xs sm:text-sm"
            aria-label="Message disappear timer"
          >
            <option value="">Don't disappear</option>
            <option value="10">10 sec</option>
            <option value="30">30 sec</option>
            <option value="60">1 min</option>
            <option value="300">5 min</option>
            <option value="3600">1 hr</option>
            <option value="86400">24 hrs</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className={`btn btn-xs sm:btn-sm btn-ghost gap-1 ${scheduledFor ? 'btn-success' : ''}`}
        >
          <Clock size={14} className="sm:w-4 sm:h-4" />
          {scheduledFor ? 'Scheduled' : 'Schedule'}
        </button>
        {isEncryptionEnabled() && selectedUser?.publicKey && (
          <button
            type="button"
            onClick={() => setIsEncrypted(!isEncrypted)}
            className={`btn btn-xs sm:btn-sm gap-1 ${isEncrypted ? 'btn-success' : 'btn-ghost'}`}
            title={isEncrypted ? 'Encryption enabled' : 'Click to encrypt message'}
          >
            <Shield size={14} className="sm:w-4 sm:h-4" />
            {isEncrypted ? 'Encrypted' : 'Encrypt'}
          </button>
        )}
      </div>

      {showSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-base-100 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative z-[10000]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-primary" />
                <h3 className="font-bold text-lg">Schedule Message</h3>
              </div>
              <button
                type="button"
                onClick={() => { setScheduledFor(""); setShowSchedule(false); }}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Select date and time</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setScheduledFor(""); setShowSchedule(false); }}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowSchedule(false)}
                  disabled={!scheduledFor}
                  className="btn btn-primary flex-1"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-1 sm:gap-2">
        <div className="flex-1 flex gap-1 sm:gap-2">
          {/* Voice Input Button */}
          {voiceToText.enabled && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`btn btn-sm btn-circle transition-all duration-200 ${
                isListening ? "btn-error" : "btn-ghost"
              }`}
              title={isListening ? "Stop voice input" : "Start voice input"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm sm:text-base"
            placeholder={isListening ? "Listening..." : "Type a message..."}
            value={text}
            onChange={handleTextChange}
            aria-label="Message input"
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <input
            type="file"
            accept="video/*"
            className="hidden"
            ref={videoInputRef}
            onChange={handleVideoChange}
          />
          <input
            type="file"
            className="hidden"
            ref={docInputRef}
            onChange={handleFileChange}
          />

          {/* Mobile attachment menu */}
          <div className="dropdown dropdown-top md:hidden">
            <button type="button" tabIndex={0} className="btn btn-ghost btn-xs sm:btn-sm btn-circle">
              <Paperclip size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 mb-2 z-50">
              <li><button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs"><Image size={16} />Image</button></li>
              <li><button type="button" onClick={() => videoInputRef.current?.click()} className="text-xs"><Video size={16} />Video</button></li>
              <li><button type="button" onClick={() => docInputRef.current?.click()} className="text-xs"><Paperclip size={16} />File</button></li>
              <li><button type="button" onClick={() => setShowVoiceRecorder(!showVoiceRecorder)} className="text-xs"><Mic size={16} />Voice</button></li>
            </ul>
          </div>
          
          {/* Desktop attachment buttons */}
          <button
            type="button"
            className={`hidden md:flex btn btn-sm btn-circle transition-all duration-200 ${
              imagePreview ? "btn-success" : "btn-ghost"
            }`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
          >
            <Image size={18} />
          </button>
          <button
            type="button"
            className={`hidden md:flex btn btn-sm btn-circle transition-all duration-200 ${
              videoPreview ? "btn-success" : "btn-ghost"
            }`}
            onClick={() => videoInputRef.current?.click()}
            title="Attach video"
          >
            <Video size={18} />
          </button>
          <button
            type="button"
            className={`hidden md:flex btn btn-sm btn-circle transition-all duration-200 ${
              filePreview ? "btn-success" : "btn-ghost"
            }`}
            onClick={() => docInputRef.current?.click()}
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <button
            type="button"
            className={`hidden md:flex btn btn-sm btn-circle transition-all duration-200 ${
              voiceData ? "btn-success" : "btn-ghost"
            }`}
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            title="Voice message"
          >
            <Mic size={18} />
          </button>
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="btn btn-sm btn-circle btn-primary btn-ripple flex-shrink-0"
          disabled={(!text.trim() && !imagePreview && !filePreview && !videoPreview && !voiceData) || isSendingMessage}
          aria-label={isSendingMessage ? 'Sending message' : 'Send message'}
        >
          {isSendingMessage ? <Loader2 size={18} className="sm:w-5 sm:h-5 animate-spin" aria-hidden="true" /> : <Send size={18} className="sm:w-5 sm:h-5" aria-hidden="true" />}
        </motion.button>
      </form>
    </div>
  );
};
export default MessageInput;