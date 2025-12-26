import { useState } from "react";
import { X, Users, Lock, Unlock } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";

const CreateGroupModal = ({ onClose }) => {
  const { createGroup } = useGroupStore();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      await createGroup(formData);
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-xl font-semibold">Create New Group</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Group Name */}
          <div>
            <label className="label">
              <span className="label-text">Group Name *</span>
            </label>
            <input
              type="text"
              placeholder="Enter group name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input input-bordered w-full"
              maxLength={50}
              required
            />
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                {formData.name.length}/50
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              placeholder="What's this group about?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="textarea textarea-bordered w-full h-20 resize-none"
              maxLength={200}
            />
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                {formData.description.length}/200
              </span>
            </div>
          </div>

          {/* Privacy Setting */}
          <div>
            <label className="label cursor-pointer">
              <div className="flex items-center gap-3">
                {formData.isPrivate ? (
                  <Lock className="w-5 h-5 text-base-content/70" />
                ) : (
                  <Unlock className="w-5 h-5 text-base-content/70" />
                )}
                <div>
                  <span className="label-text font-medium">
                    {formData.isPrivate ? "Private Group" : "Public Group"}
                  </span>
                  <div className="text-xs text-base-content/60">
                    {formData.isPrivate
                      ? "Only invited members can join"
                      : "Anyone with invite link can join"
                    }
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                className="toggle toggle-primary"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Create Group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;