import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Paperclip, Mic, Video, Timer } from "lucide-react";
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
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const docInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, replyingTo, setReplyingTo, editingMessage, setEditingMessage, emitTyping, emitStopTyping, messages } = useChatStore();
  const { authUser } = useAuthStore();
  
  const lastReceivedMessage = messages.filter(m => m.senderId !== authUser._id).slice(-1)[0];

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || "");
    }
  }, [editingMessage]);

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

    try {
      if (editingMessage) {
        await useChatStore.getState().editMessage(editingMessage._id, text.trim());
      } else {
        await sendMessage({
          text: text.trim(),
          image: imagePreview,
          file: filePreview,
          video: videoPreview,
          voice: voiceData,
          disappearAfter,
        });
      }

      emitStopTyping();
      setText("");
      setImagePreview(null);
      setVideoPreview(null);
      setFilePreview(null);
      setVoiceData(null);
      setDisappearAfter(null);
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

      <div className="hidden sm:flex items-center gap-2 mb-2">
        <Timer size={16} className="text-base-content/60" />
        <select 
          value={disappearAfter || ""} 
          onChange={(e) => setDisappearAfter(e.target.value ? parseInt(e.target.value) : null)}
          className="select select-sm select-bordered"
        >
          <option value="">Don't disappear</option>
          <option value="10">10 seconds</option>
          <option value="30">30 seconds</option>
          <option value="60">1 minute</option>
          <option value="300">5 minutes</option>
          <option value="3600">1 hour</option>
          <option value="86400">24 hours</option>
        </select>
      </div>

      <form onSubmit={handleSendMessage} className="flex items-center gap-1 sm:gap-2">
        <div className="flex-1 flex gap-1 sm:gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm sm:text-base"
            placeholder="Type a message..."
            value={text}
            onChange={handleTextChange}
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
          <div className="dropdown dropdown-top sm:hidden">
            <button type="button" tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
              <Paperclip size={18} />
            </button>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 mb-2">
              <li><button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs"><Image size={16} />Image</button></li>
              <li><button type="button" onClick={() => videoInputRef.current?.click()} className="text-xs"><Video size={16} />Video</button></li>
              <li><button type="button" onClick={() => docInputRef.current?.click()} className="text-xs"><Paperclip size={16} />File</button></li>
              <li><button type="button" onClick={() => setShowVoiceRecorder(!showVoiceRecorder)} className="text-xs"><Mic size={16} />Voice</button></li>
            </ul>
          </div>
          
          {/* Desktop attachment buttons */}
          <button
            type="button"
            className={`hidden sm:flex btn btn-sm btn-circle transition-all duration-200 ${
              imagePreview ? "btn-success" : "btn-ghost"
            }`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
          >
            <Image size={18} />
          </button>
          <button
            type="button"
            className={`hidden sm:flex btn btn-sm btn-circle transition-all duration-200 ${
              videoPreview ? "btn-success" : "btn-ghost"
            }`}
            onClick={() => videoInputRef.current?.click()}
            title="Attach video"
          >
            <Video size={18} />
          </button>
          <button
            type="button"
            className={`hidden sm:flex btn btn-sm btn-circle transition-all duration-200 ${
              filePreview ? "btn-success" : "btn-ghost"
            }`}
            onClick={() => docInputRef.current?.click()}
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <button
            type="button"
            className={`hidden sm:flex btn btn-sm btn-circle transition-all duration-200 ${
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
          disabled={!text.trim() && !imagePreview && !filePreview && !videoPreview && !voiceData}
        >
          <Send size={18} className="sm:w-5 sm:h-5" />
        </motion.button>
      </form>
    </div>
  );
};
export default MessageInput;