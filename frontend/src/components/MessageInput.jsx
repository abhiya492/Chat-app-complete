import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";

const EMOJIS = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "😍", "🤔", "👏", "🙌"];

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setImagePreview(compressedBase64);
      };
      img.src = reader.result;
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

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full border-t border-base-300/50 glass-effect relative">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2 relative z-10 animate-scale-in">
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-xl border-2 border-primary/40 shadow-xl ring-2 ring-primary/20 group-hover:scale-105 transition-transform"
            />
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
            accept="image/*"
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
            <Image size={20} className="md:w-[22px] md:h-[22px]" />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-circle h-11 w-11 md:h-12 md:w-12 shadow-lg shadow-primary/40 hover:shadow-2xl hover:shadow-primary/60 hover:scale-110 hover:rotate-12 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-primary to-primary/80"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={18} className="md:w-5 md:h-5" />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;