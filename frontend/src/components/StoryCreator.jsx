import { useState, useRef } from "react";
import { X, Image, Video, Type, Loader } from "lucide-react";
import { useStoryStore } from "../store/useStoryStore";
import toast from "react-hot-toast";

const StoryCreator = ({ onClose }) => {
  const [type, setType] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [textContent, setTextContent] = useState("");
  const [bgColor, setBgColor] = useState("#000000");
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const { createStory, isCreating } = useStoryStore();

  const handleFileSelect = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setType(fileType);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      const storyData = { type, caption };

      if (type === "text") {
        storyData.content = { text: textContent, backgroundColor: bgColor, textColor: "#FFFFFF" };
      } else {
        storyData.content = { data: preview };
      }

      await createStory(storyData);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-base-100 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Story</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X />
          </button>
        </div>

        {!type && (
          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => imageInputRef.current?.click()} className="btn btn-outline flex-col h-24">
              <Image size={32} />
              <span className="text-xs mt-2">Image</span>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "image")} />
            </button>
            <button onClick={() => videoInputRef.current?.click()} className="btn btn-outline flex-col h-24">
              <Video size={32} />
              <span className="text-xs mt-2">Video</span>
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, "video")} />
            </button>
            <button onClick={() => setType("text")} className="btn btn-outline flex-col h-24">
              <Type size={32} />
              <span className="text-xs mt-2">Text</span>
            </button>
          </div>
        )}

        {type === "text" && (
          <div className="space-y-4">
            <div className="h-64 rounded-lg flex items-center justify-center p-4" style={{ backgroundColor: bgColor }}>
              <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Type your story..." className="w-full h-full bg-transparent text-white text-2xl text-center resize-none outline-none" maxLength={200} />
            </div>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10" />
          </div>
        )}

        {(type === "image" || type === "video") && preview && (
          <div className="space-y-4">
            {type === "image" ? (
              <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
            ) : (
              <video src={preview} className="w-full h-64 object-cover rounded-lg" controls />
            )}
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption..." className="input input-bordered w-full" maxLength={200} />
          </div>
        )}

        {type && (
          <div className="flex gap-2 mt-4">
            <button onClick={() => { setType(null); setPreview(null); }} className="btn btn-ghost flex-1">Back</button>
            <button onClick={handleSubmit} disabled={isCreating || (type === "text" && !textContent)} className="btn btn-primary flex-1">
              {isCreating ? <Loader className="animate-spin" /> : "Post Story"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryCreator;
