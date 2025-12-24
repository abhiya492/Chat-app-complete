import { useState, useEffect } from "react";
import { useContactStore } from "../store/useContactStore";
import { 
  Search, 
  X, 
  UserPlus, 
  Loader2,
  Users,
  Mail
} from "lucide-react";

const AddContact = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const {
    searchResults,
    isSearching,
    searchUsers,
    sendContactRequest,
    clearSearchResults,
  } = useContactStore();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search users when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchUsers(debouncedQuery);
    } else {
      clearSearchResults();
    }
  }, [debouncedQuery]);

  const handleSendRequest = async (userId) => {
    try {
      await sendContactRequest(userId);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleClose = () => {
    clearSearchResults();
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New Contact
          </h3>
          <button
            onClick={handleClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="form-control mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-10 pr-10"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-base-content/50" />
            )}
          </div>
          <div className="label">
            <span className="label-text-alt">
              Search for users by their name or email address
            </span>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {!searchQuery.trim() && (
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto text-base-300 mb-4" />
              <p className="text-base-content/70">
                Start typing to search for users
              </p>
            </div>
          )}

          {searchQuery.trim() && !isSearching && searchResults.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto text-base-300 mb-4" />
              <p className="text-base-content/70 mb-2">
                No users found
              </p>
              <p className="text-sm text-base-content/50">
                Try searching with a different name or email
              </p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full">
                          <img
                            src={user.profilePic || "/avatar.png"}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {user.fullName}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-base-content/70">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.status && (
                          <p className="text-xs text-base-content/50 truncate mt-1">
                            {user.status}
                          </p>
                        )}
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => handleSendRequest(user._id)}
                        className="btn btn-sm btn-primary"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-action">
          <button onClick={handleClose} className="btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContact;