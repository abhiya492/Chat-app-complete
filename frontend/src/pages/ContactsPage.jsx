import { useState, useEffect } from "react";
import { useContactStore } from "../store/useContactStore";
import { Search, UserPlus, Users, Clock, Send, Star, Filter } from "lucide-react";
import ContactCard from "../components/ContactCard";
import AddContactModal from "../components/AddContactModal";
import ContactRequests from "../components/ContactRequests";

const ContactsPage = () => {
  const { 
    contacts, 
    pendingRequests, 
    sentRequests, 
    fetchContacts, 
    fetchPendingRequests, 
    fetchSentRequests,
    isLoading 
  } = useContactStore();
  
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchPendingRequests();
    fetchSentRequests();
  }, []);

  const filteredContacts = (contacts || []).filter(contact => {
    const matchesSearch = contact.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.nickname && contact.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGroup = selectedGroup === "all" || contact.group === selectedGroup;
    const matchesTab = activeTab === "all" || 
                      (activeTab === "favorites" && contact.isFavorite);
    
    return matchesSearch && matchesGroup && matchesTab;
  });

  const contactGroups = [...new Set((contacts || []).map(c => c.group))];

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
            <h1 className="text-3xl font-bold text-base-content">Contacts</h1>
            <p className="text-base-content/70 mt-1">
              Manage your connections and friends
            </p>
          </div>
          
          <div className="flex gap-2">
            {pendingRequests.length > 0 && (
              <button
                onClick={() => setShowRequests(true)}
                className="btn btn-outline btn-sm relative"
              >
                <Clock className="w-4 h-4" />
                Requests
                <div className="badge badge-primary badge-sm absolute -top-2 -right-2">
                  {pendingRequests.length}
                </div>
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary btn-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-bordered mb-6">
          <button
            className={`tab ${activeTab === "all" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <Users className="w-4 h-4 mr-2" />
            All ({(contacts || []).length})
          </button>
          <button
            className={`tab ${activeTab === "favorites" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("favorites")}
          >
            <Star className="w-4 h-4 mr-2" />
            Favorites ({(contacts || []).filter(c => c.isFavorite).length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-10"
            />
          </div>

          {/* Group Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-base-content/50" />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="select select-bordered"
            >
              <option value="all">All Groups</option>
              {contactGroups.map(group => (
                <option key={group} value={group}>
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contacts Grid */}
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-base-content/70 mb-2">
              {searchTerm || selectedGroup !== "all" ? "No contacts found" : "No contacts yet"}
            </h3>
            <p className="text-base-content/50 mb-6">
              {searchTerm || selectedGroup !== "all"
                ? "Try adjusting your search or filters"
                : "Start building your network by adding contacts"
              }
            </p>
            {!searchTerm && selectedGroup === "all" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <UserPlus className="w-4 h-4" />
                Add Your First Contact
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <ContactCard key={contact._id} contact={contact} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddContactModal onClose={() => setShowAddModal(false)} />
      )}
      
      {showRequests && (
        <ContactRequests onClose={() => setShowRequests(false)} />
      )}
    </div>
  );
};

export default ContactsPage;