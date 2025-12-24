import { useState } from "react";
import { useContactStore } from "../store/useContactStore";
import { 
  Check, 
  X, 
  Clock, 
  UserPlus, 
  Users,
  Inbox,
  Send
} from "lucide-react";
import { formatMessageTime } from "../lib/utils";

const ContactRequests = ({ pendingRequests, sentRequests }) => {
  const [activeTab, setActiveTab] = useState("received");
  const { acceptContactRequest, rejectContactRequest } = useContactStore();

  const handleAcceptRequest = async (requestId) => {
    await acceptContactRequest(requestId);
  };

  const handleRejectRequest = async (requestId) => {
    await rejectContactRequest(requestId);
  };

  const tabs = [
    {
      id: "received",
      label: "Received",
      icon: Inbox,
      count: pendingRequests.length,
    },
    {
      id: "sent",
      label: "Sent",
      icon: Send,
      count: sentRequests.length,
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Tabs */}
      <div className="p-4 border-b border-base-300">
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "received" && (
          <ReceivedRequests
            requests={pendingRequests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />
        )}
        {activeTab === "sent" && (
          <SentRequests requests={sentRequests} />
        )}
      </div>
    </div>
  );
};

const ReceivedRequests = ({ requests, onAccept, onReject }) => {
  if (requests.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Inbox className="w-16 h-16 mx-auto text-base-300 mb-4" />
          <h3 className="text-lg font-medium text-base-content/70 mb-2">
            No pending requests
          </h3>
          <p className="text-sm text-base-content/50">
            You'll see contact requests here when someone wants to add you
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {requests.map((request) => (
        <div
          key={request._id}
          className="card bg-base-100 shadow-sm border border-primary/20"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  <img
                    src={request.requester.profilePic || "/avatar.png"}
                    alt={request.requester.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Request Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">
                  {request.requester.fullName}
                </h3>
                <p className="text-sm text-base-content/70 truncate">
                  {request.requester.status || "Hey there! I'm using this chat app"}
                </p>
                <p className="text-xs text-base-content/50">
                  Sent {formatMessageTime(request.createdAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onAccept(request._id)}
                  className="btn btn-sm btn-success"
                  title="Accept Request"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onReject(request._id)}
                  className="btn btn-sm btn-error"
                  title="Reject Request"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SentRequests = ({ requests }) => {
  if (requests.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Send className="w-16 h-16 mx-auto text-base-300 mb-4" />
          <h3 className="text-lg font-medium text-base-content/70 mb-2">
            No sent requests
          </h3>
          <p className="text-sm text-base-content/50">
            Contact requests you send will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {requests.map((request) => (
        <div
          key={request._id}
          className="card bg-base-100 shadow-sm"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  <img
                    src={request.recipient.profilePic || "/avatar.png"}
                    alt={request.recipient.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Request Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">
                  {request.recipient.fullName}
                </h3>
                <p className="text-sm text-base-content/70 truncate">
                  {request.recipient.status || "Hey there! I'm using this chat app"}
                </p>
                <p className="text-xs text-base-content/50">
                  Sent {formatMessageTime(request.createdAt)}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-warning">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Pending</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactRequests;