import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import MessageActions from "./MessageActions";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-gradient-to-br from-base-100 via-base-200/20 to-base-100 relative">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 animate-bounce-subtle">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-base-content/60 text-lg font-medium">No messages yet</p>
            <p className="text-base-content/40 text-sm mt-2">Start the conversation!</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"} group`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border-2 border-base-300 shadow-lg ring-2 ring-base-100 hover:scale-110 transition-transform duration-200">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                  className="rounded-full"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1 font-medium group-hover:opacity-70 transition-opacity">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className={`chat-bubble flex flex-col shadow-lg hover:shadow-xl transition-all duration-200 relative backdrop-blur-sm group/bubble ${
              message.senderId === authUser._id 
                ? "bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-content border border-primary/20 hover:from-primary hover:to-primary/90" 
                : "bg-base-200/80 text-base-content border border-base-300/50 hover:bg-base-200/90"
            }`}>
              {message.text && (
                <MessageActions 
                  message={message} 
                  isOwnMessage={message.senderId === authUser._id}
                  onDelete={deleteMessage}
                />
              )}
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-xl mb-2 shadow-md cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 border border-base-300/30"
                  onClick={() => window.open(message.image, '_blank')}
                />
              )}
              {message.text && <p className="break-words whitespace-pre-wrap leading-relaxed">{message.text}</p>}
              
              {/* Message reactions placeholder */}
              <div className="absolute -bottom-2 right-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex gap-1">
                <button className="text-xs bg-base-100 hover:bg-base-200 rounded-full px-2 py-0.5 shadow-md hover:scale-110 transition-all">👍</button>
                <button className="text-xs bg-base-100 hover:bg-base-200 rounded-full px-2 py-0.5 shadow-md hover:scale-110 transition-all">❤️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;