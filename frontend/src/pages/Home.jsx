

import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const Home = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      <div className="flex items-center justify-center pt-16 md:pt-20 px-2 md:px-4">
        <div className="bg-base-100/80 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-2xl border border-base-300/50 w-full max-w-7xl h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-xl md:rounded-2xl overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;