import { useState } from "react";
import { X, Send } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const ForwardModal = ({ message, onClose }) => {
  const { users, forwardMessage } = useChatStore();
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleForward = async () => {
    if (selectedUsers.length === 0) return;
    await forwardMessage(message._id, selectedUsers);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Forward Message</h3>
          <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => toggleUser(user._id)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedUsers.includes(user._id) ? 'bg-primary/20' : 'hover:bg-base-200'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedUsers.includes(user._id)}
                onChange={() => {}}
                className="checkbox checkbox-primary"
              />
              <img
                src={user.profilePic || "/avatar.png"}
                alt=""
                className="size-10 rounded-full"
              />
              <span className="font-medium">{user.fullName}</span>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-base-300 flex gap-2">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={selectedUsers.length === 0}
            className="btn btn-primary flex-1"
          >
            <Send size={18} />
            Forward ({selectedUsers.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;
