import { useCallback, memo } from "react";
import { X, Check, UserX } from "lucide-react";
import { useContactStore } from "../store/useContactStore";

const ContactRequests = memo(({ onClose }) => {
  const { pendingRequests, acceptContactRequest, rejectContactRequest } = useContactStore();

  const handleAccept = useCallback(async (requestId) => {
    await acceptContactRequest(requestId);
  }, [acceptContactRequest]);

  const handleReject = useCallback(async (requestId) => {
    await rejectContactRequest(requestId);
  }, [rejectContactRequest]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-xl font-semibold">Contact Requests</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              No pending requests
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full">
                        <img src={request.requester.profilePic || "/avatar.png"} alt={request.requester.fullName} />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{request.requester.fullName}</div>
                      <div className="text-sm text-base-content/60">{request.requester.status}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(request._id)}
                      className="btn btn-success btn-sm"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      className="btn btn-error btn-sm"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ContactRequests;