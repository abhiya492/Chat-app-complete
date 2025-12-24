import { useState } from "react";
import { useContactStore } from "../store/useContactStore";
import { useChatStore } from "../store/useChatStore";
import { 
  MessageCircle, 
  Heart, 
  HeartOff, 
  Edit3, 
  Trash2, 
  MoreVertical,
  Phone,
  Video,
  User
} from "lucide-react";
import { formatMessageTime } from "../lib/utils";

const ContactList = ({ contacts, selectedGroup }) => {
  const [editingContact, setEditingContact] = useState(null);
  const [editForm, setEditForm] = useState({ nickname: "", group: "general" });
  
  const { updateContact, removeContact } = useContactStore();
  const { setSelectedUser } = useChatStore();

  const handleStartChat = (contact) => {
    setSelectedUser(contact.user);
  };

  const handleToggleFavorite = async (contact) => {
    await updateContact(contact._id, { isFavorite: !contact.isFavorite });
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact._id);
    setEditForm({
      nickname: contact.nickname || "",
      group: contact.group || "general",
    });
  };

  const handleSaveEdit = async (contactId) => {
    await updateContact(contactId, editForm);
    setEditingContact(null);
  };

  const handleRemoveContact = async (contactId) => {
    if (confirm("Are you sure you want to remove this contact?")) {
      await removeContact(contactId);
    }
  };

  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto text-base-300 mb-4" />
          <h3 className="text-lg font-medium text-base-content/70 mb-2">
            No contacts found
          </h3>
          <p className="text-sm text-base-content/50">
            {selectedGroup === "all" 
              ? "Start by adding some contacts!"
              : `No contacts in ${selectedGroup} group`
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-2">
        {contacts.map((contact) => (
          <div
            key={contact._id}
            className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full">
                    <img
                      src={contact.user.profilePic || "/avatar.png"}
                      alt={contact.user.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  {editingContact === contact._id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Nickname (optional)"
                        value={editForm.nickname}
                        onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                        className="input input-sm input-bordered w-full"
                      />
                      <select
                        value={editForm.group}
                        onChange={(e) => setEditForm({ ...editForm, group: e.target.value })}
                        className="select select-sm select-bordered w-full"
                      >
                        <option value="general">General</option>
                        <option value="family">Family</option>
                        <option value="friends">Friends</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(contact._id)}
                          className="btn btn-xs btn-primary"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingContact(null)}
                          className="btn btn-xs btn-ghost"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">
                          {contact.nickname || contact.user.fullName}
                        </h3>
                        {contact.isFavorite && (
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        )}
                      </div>
                      {contact.nickname && (
                        <p className="text-sm text-base-content/70 truncate">
                          {contact.user.fullName}
                        </p>
                      )}
                      <p className="text-xs text-base-content/50 truncate">
                        {contact.user.status || "Hey there! I'm using this chat app"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-base-content/50">
                        <span className="badge badge-xs badge-outline">
                          {contact.group}
                        </span>
                        <span>•</span>
                        <span>Added {formatMessageTime(contact.createdAt)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                {editingContact !== contact._id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartChat(contact)}
                      className="btn btn-sm btn-ghost btn-circle"
                      title="Start Chat"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleToggleFavorite(contact)}
                      className={`btn btn-sm btn-ghost btn-circle ${
                        contact.isFavorite ? "text-red-500" : ""
                      }`}
                      title={contact.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      {contact.isFavorite ? (
                        <Heart className="w-4 h-4 fill-current" />
                      ) : (
                        <HeartOff className="w-4 h-4" />
                      )}
                    </button>

                    <div className="dropdown dropdown-end">
                      <button
                        tabIndex={0}
                        className="btn btn-sm btn-ghost btn-circle"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                      >
                        <li>
                          <button onClick={() => handleEditContact(contact)}>
                            <Edit3 className="w-4 h-4" />
                            Edit Contact
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleRemoveContact(contact._id)}
                            className="text-error"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove Contact
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList;