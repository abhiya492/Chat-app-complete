import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Paperclip, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";

const EMOJIS = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "😍", "🤔", "👏", "🙌"];

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isImage = file.type.startsWith("image/");
    const maxSize = isImage ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
    
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${isImage ? '10MB' : '25MB'} allowed`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSending) return;

    setIsSending(true);
    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 w-full border-t border-base-300/50 glass-effect relative">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2 relative z-10 animate-scale-in">
          <div className="relative group">
            {imagePreview.startsWith('data:image/') ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-xl border-2 border-primary/40 shadow-xl ring-2 ring-primary/20 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border-2 border-primary/40 shadow-xl ring-2 ring-primary/20 flex flex-col items-center justify-center">
                <Paperclip className="w-8 h-8 text-primary mb-1" />
                <span className="text-xs text-center font-medium text-primary">File</span>
              </div>
            )}
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-error to-error/80 text-error-content
              flex items-center justify-center shadow-lg hover:scale-125 hover:rotate-90 transition-all duration-300"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-3 relative z-10">
        <div className="flex-1 flex gap-1 md:gap-2 relative">
          <input
            type="text"
            className="w-full input input-bordered rounded-2xl h-11 md:h-12 text-sm md:text-base focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all bg-base-200/70 backdrop-blur-sm shadow-inner hover:bg-base-200/90 placeholder:text-base-content/40"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="*/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className="btn btn-circle h-11 w-11 md:h-12 md:w-12 transition-all hover:scale-110 hover:rotate-12 btn-ghost hover:bg-primary/10 hover:text-primary shadow-md hover:shadow-lg"
            onClick={() => setShowEmoji(!showEmoji)}
          >
            <Smile size={20} className="md:w-[22px] md:h-[22px]" />
          </button>
          
          {showEmoji && (
            <div className="absolute bottom-full mb-2 right-0 glass-effect rounded-2xl shadow-2xl p-3 grid grid-cols-5 gap-2 z-50 animate-scale-in">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setText(text + emoji);
                    setShowEmoji(false);
                  }}
                  className="text-2xl hover:scale-150 hover:rotate-12 transition-all duration-200 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className={`btn btn-circle h-11 w-11 md:h-12 md:w-12 transition-all hover:scale-110 hover:rotate-12 shadow-md hover:shadow-lg
                     ${imagePreview ? "btn-success text-success-content shadow-success/30" : "btn-ghost hover:bg-primary/10 hover:text-primary"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={20} className="md:w-[22px] md:h-[22px]" />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-circle h-11 w-11 md:h-12 md:w-12 shadow-lg shadow-primary/40 hover:shadow-2xl hover:shadow-primary/60 hover:scale-110 hover:rotate-12 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-primary to-primary/80"
          disabled={(!text.trim() && !imagePreview) || isSending}
        >
          {isSending ? (
            <div className="loading loading-spinner loading-sm"></div>
          ) : (
            <Send size={18} className="md:w-5 md:h-5" />
          )}
        </button>
      </form>
    </div>
  );
};
export default MessageInput;