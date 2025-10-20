import { Copy, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "./EmojiPicker";

const MessageActions = ({ message, onDelete, isOwnMessage }) => {
  const copyMessage = () => {
    navigator.clipboard.writeText(message.text);
    toast.success("Message copied!");
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      onDelete(message._id);
    }
  };

  return (
    <div className="absolute -top-8 right-0 bg-base-200 rounded-lg shadow-lg border border-base-300 p-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <EmojiPicker onSelect={(emoji) => toast.success(`Reacted with ${emoji}`)} />
      <button
        onClick={copyMessage}
        className="btn btn-xs btn-ghost hover:bg-primary/10 hover:text-primary"
        title="Copy message"
      >
        <Copy className="size-3" />
      </button>
      {isOwnMessage && (
        <button
          onClick={handleDelete}
          className="btn btn-xs btn-ghost hover:bg-error/10 hover:text-error"
          title="Delete message"
        >
          <Trash2 className="size-3" />
        </button>
      )}
    </div>
  );
};

export default MessageActions;
