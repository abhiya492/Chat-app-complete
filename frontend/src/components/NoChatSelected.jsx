import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-gradient-to-br from-base-100/50 to-base-200/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      
      <div className="max-w-md text-center space-y-6 relative z-10">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center
             justify-center animate-bounce shadow-xl"
            >
              <MessageSquare className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-secondary opacity-20 blur-xl animate-pulse"></div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Welcome to Chatty!</h2>
        <p className="text-base-content/70 text-lg">
          Select a conversation from the sidebar to start chatting
        </p>
        <div className="pt-4">
          <div className="inline-flex items-center gap-2 text-sm text-base-content/50 bg-base-200/50 px-4 py-2 rounded-full">
            <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Ready to connect</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;