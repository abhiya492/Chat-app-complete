import { useState, useCallback, memo } from "react";
import { MessageCircle, Star, MoreVertical, UserMinus, Edit3 } from "lucide-react";
import { useContactStore } from "../store/useContactStore";
import { useNavigate } from "react-router-dom";

const ContactCard = memo(({ contact }) => {
  const { toggleFavorite, removeContact, updateContactNickname } = useContactStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(contact.nickname || "");

  const handleChat = useCallback(() => {
    navigate(`/?userId=${contact.user._id}`);
  }, [navigate, contact.user._id]);

  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(contact._id, contact.isFavorite);
  }, [toggleFavorite, contact._id, contact.isFavorite]);

  const handleRemove = useCallback(() => {
    if (confirm("Remove this contact?")) {
      removeContact(contact._id);
    }
  }, [removeContact, contact._id]);

  const handleSaveNickname = useCallback(() => {
    updateContactNickname(contact._id, nickname);
    setEditing(false);
  }, [updateContactNickname, contact._id, nickname]);

  return (
    <div className="card bg-base-200 shadow-lg">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full">
                <img src={contact.user.profilePic || "/avatar.png"} alt={contact.user.fullName} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">{contact.nickname || contact.user.fullName}</h3>
              <p className="text-sm text-base-content/60">{contact.user.status}</p>
            </div>
          </div>
          
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-xs">
              <MoreVertical className="w-4 h-4" />
            </button>
            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><button onClick={() => setEditing(true)}><Edit3 className="w-4 h-4" />Edit</button></li>
              <li><button onClick={handleToggleFavorite}><Star className="w-4 h-4" />{contact.isFavorite ? "Unfavorite" : "Favorite"}</button></li>
              <li><button onClick={handleRemove} className="text-error"><UserMinus className="w-4 h-4" />Remove</button></li>
            </ul>
          </div>
        </div>

        {editing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input input-bordered input-sm flex-1"
              placeholder="Enter nickname"
            />
            <button onClick={handleSaveNickname} className="btn btn-primary btn-sm">Save</button>
            <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm">Cancel</button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            {contact.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
            <button onClick={handleChat} className="btn btn-primary btn-sm">
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default ContactCard;