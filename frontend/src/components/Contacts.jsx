import { useState, useEffect } from "react";
import { useContactStore } from "../store/useContactStore";
import { Users, UserPlus, Search, Filter, Heart, MessageCircle } from "lucide-react";
import ContactList from "./ContactList";
import ContactRequests from "./ContactRequests";
import AddContact from "./AddContact";
import LoadingSpinner from "./LoadingSpinner";

const Contacts = () => {
  const [activeTab, setActiveTab] = useState("contacts");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [showAddContact, setShowAddContact] = useState(false);

  const {
    contacts,
    pendingRequests,
    sentRequests,
    isLoading,
    fetchContacts,
    fetchPendingRequests,
    fetchSentRequests,
    getContactGroups,
  } = useContactStore();

  useEffect(() => {
    fetchContacts();
    fetchPendingRequests();
    fetchSentRequests();
  }, [fetchContacts, fetchPendingRequests, fetchSentRequests]);

  const tabs = [
    {
      id: "contacts",
      label: "Contacts",
      icon: Users,
      count: (contacts || []).length,
    },
    {
      id: "requests",
      label: "Requests",
      icon: UserPlus,
      count: (pendingRequests || []).length,
    },
  ];

  const groups = [
    { id: "all", label: "All Contacts", count: (contacts || []).length },
    { id: "favorites", label: "Favorites", count: (contacts || []).filter(c => c.isFavorite).length },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Contacts
          </h1>
          <button
            onClick={() => setShowAddContact(true)}
            className="btn btn-primary btn-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Contact
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab gap-2 ${activeTab === tab.id ? "tab-active" : ""}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="badge badge-sm badge-primary">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Group Filter (only for contacts tab) */}
        {activeTab === "contacts" && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter by group:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`btn btn-xs ${
                    selectedGroup === group.id
                      ? "btn-primary"
                      : "btn-outline btn-primary"
                  }`}
                >
                  {group.label}
                  {group.count > 0 && (
                    <span className="ml-1">({group.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "contacts" && (
          <ContactList
            contacts={selectedGroup === "favorites" 
              ? (contacts || []).filter(c => c.isFavorite)
              : (contacts || [])
            }
            selectedGroup={selectedGroup}
          />
        )}
        {activeTab === "requests" && (
          <ContactRequests
            pendingRequests={pendingRequests}
            sentRequests={sentRequests}
          />
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <AddContact onClose={() => setShowAddContact(false)} />
      )}
    </div>
  );
};

export default Contacts;