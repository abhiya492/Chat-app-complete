import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import { Plus, Users, Settings, Search } from "lucide-react";
import CreateGroupModal from "../components/CreateGroupModal";
import GroupCard from "../components/GroupCard";
import JoinGroupModal from "../components/JoinGroupModal";
import toast from "react-hot-toast";

const Groups = () => {
  const { authUser } = useAuthStore();
  const { groups, fetchGroups, isLoading } = useGroupStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content">My Groups</h1>
            <p className="text-base-content/70 mt-1">
              Connect with communities and friends
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn btn-outline btn-sm"
            >
              <Users className="w-4 h-4" />
              Join Group
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-base-content/70 mb-2">
              {searchTerm ? "No groups found" : "No groups yet"}
            </h3>
            <p className="text-base-content/50 mb-6">
              {searchTerm 
                ? "Try adjusting your search terms"
                : "Create your first group or join an existing one"
              }
            </p>
            {!searchTerm && (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="btn btn-outline"
                >
                  Join Group
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  Create Group
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateGroupModal onClose={() => setShowCreateModal(false)} />
      )}
      
      {showJoinModal && (
        <JoinGroupModal onClose={() => setShowJoinModal(false)} />
      )}
    </div>
  );
};

export default Groups;