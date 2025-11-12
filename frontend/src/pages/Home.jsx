

import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import StoryBar from "../components/StoryBar";

const Home = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/15 rounded-full blur-3xl float" style={{ animationDelay: '0.7s' }}></div>
      </div>
      
      <div className="flex items-center justify-center pt-16 md:pt-20 px-2 md:px-4 relative z-10">
        <div className="glass-effect rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-7xl h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)] animate-fade-in border border-white/10">
          <div className="flex flex-col h-full rounded-2xl md:rounded-3xl overflow-hidden">
            <StoryBar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;