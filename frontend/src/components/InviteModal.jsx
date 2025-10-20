import { useState } from "react";
import { X, Mail, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const InviteModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await axiosInstance.post("/invitations/send", { email });
      toast.success("Invitation sent successfully!");
      setEmail("");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Invite Friends
          </h2>
          <button
            onClick={onClose}
            className="btn btn-xs sm:btn-sm btn-circle btn-ghost hover:bg-error/10 hover:text-error"
          >
            <X className="size-4 sm:size-5" />
          </button>
        </div>

        <form onSubmit={handleInvite} className="space-y-3 sm:space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-sm sm:text-base">Email Address</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/40 group-focus-within:text-primary" />
              </div>
              <input
                type="email"
                className="input input-bordered w-full pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full h-10 sm:h-12 text-sm sm:text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                <span className="hidden sm:inline">Sending...</span>
                <span className="sm:hidden">Sending</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Send Invitation</span>
                <span className="sm:hidden">Send</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/20">
          <p className="text-xs sm:text-sm text-base-content/70">
            💡 Your friend will receive an email with a link to join Chatty. The invitation is valid for 7 days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
