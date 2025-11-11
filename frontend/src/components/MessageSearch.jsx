import { useState } from "react";
import { Search, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { formatMessageTime } from "../lib/utils";

const MessageSearch = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const { searchMessages, searchResults, clearSearch, setSelectedUser, users } = useChatStore();

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      searchMessages(value);
    } else {
      clearSearch();
    }
  };

  const handleResultClick = (message) => {
    const otherUserId = message.senderId._id === message.senderId ? message.receiverId._id : message.senderId._id;
    const user = users.find(u => u._id === otherUserId);
    if (user) {
      setSelectedUser(user);
      onClose();
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-base-100 z-50 flex flex-col animate-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/50" />
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="Search messages..."
              className="w-full input input-bordered pl-10"
              autoFocus
            />
          </div>
          <button onClick={onClose} className="btn btn-circle btn-ghost">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {searchResults.length === 0 && query && (
          <div className="text-center text-base-content/50 mt-8">
            No messages found
          </div>
        )}
        {searchResults.map((message) => (
          <div
            key={message._id}
            onClick={() => handleResultClick(message)}
            className="p-3 hover:bg-base-200 rounded-lg cursor-pointer transition-colors mb-2"
          >
            <div className="flex items-center gap-3">
              <img
                src={message.senderId.profilePic || "/avatar.png"}
                alt=""
                className="size-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{message.senderId.fullName}</span>
                  <span className="text-xs text-base-content/50">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-base-content/70 truncate">{message.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageSearch;
