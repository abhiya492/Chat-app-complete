import { Smile } from "lucide-react";
import { useState } from "react";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const EmojiPicker = ({ onSelect }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="btn btn-xs btn-ghost hover:bg-primary/10"
        title="React"
      >
        <Smile className="size-3" />
      </button>
      {show && (
        <div className="absolute bottom-full mb-1 right-0 bg-base-200 rounded-lg shadow-lg border border-base-300 p-2 flex gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                setShow(false);
              }}
              className="hover:scale-125 transition-transform text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
