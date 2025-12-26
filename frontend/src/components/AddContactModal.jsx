import { useState, useEffect, useCallback, memo } from "react";
import { X, Search, UserPlus } from "lucide-react";
import { useContactStore } from "../store/useContactStore";

const AddContactModal = memo(({ onClose }) => {
  const { searchUsers, sendContactRequest, searchResults, clearSearchResults } = useContactStore();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        searchUsers(query);
      } else {
        clearSearchResults();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query, searchUsers, clearSearchResults]);

  const handleSendRequest = useCallback(async (userId) => {
    setIsLoading(true);
    try {
      await sendContactRequest(userId);
    } finally {
      setIsLoading(false);
    }
  }, [sendContactRequest]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-xl font-semibold">Add Contact</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input input-bordered w-full pl-10"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {searchResults.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-base-content/60">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleSendRequest(user._id)}
                  className="btn btn-primary btn-sm"
                  disabled={isLoading}
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {query.length >= 2 && searchResults.length === 0 && (
            <div className="text-center py-8 text-base-content/60">
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default AddContactModal;