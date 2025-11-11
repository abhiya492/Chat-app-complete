import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageSearch from "./MessageSearch";
import ForwardModal from "./ForwardModal";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Smile, Reply, Edit2, Trash2, Download, Pin, Forward, Check, CheckCheck, Play, Pause } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    addReaction,
    removeReaction,
    deleteMessage,
    setReplyingTo,
    setEditingMessage,
    typingUsers,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [playingVoice, setPlayingVoice] = useState(null);
  const audioRef = useRef(null);

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  const { forwardingMessage, setForwardingMessage, markAsRead, pinMessage } = useChatStore();

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    messages.forEach(msg => {
      if (msg.senderId !== authUser._id && !msg.readBy?.some(r => r.userId === authUser._id)) {
        markAsRead(msg._id);
      }
    });
  }, [messages, authUser._id, markAsRead]);

  const toggleVoicePlay = (voiceUrl, messageId) => {
    if (playingVoice === messageId) {
      audioRef.current?.pause();
      setPlayingVoice(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = voiceUrl;
        audioRef.current.play();
        setPlayingVoice(messageId);
        audioRef.current.onended = () => setPlayingVoice(null);
      }
    }
  };

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader 
          onSearchClick={() => setShowSearch(true)}
          onPinnedClick={() => {
            useChatStore.getState().getPinnedMessages(selectedUser._id);
          }}
        />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader 
        onSearchClick={() => setShowSearch(true)}
        onPinnedClick={() => {
          useChatStore.getState().getPinnedMessages(selectedUser._id);
        }}
      />

      {showSearch && <MessageSearch onClose={() => setShowSearch(false)} />}
      {forwardingMessage && <ForwardModal message={forwardingMessage} onClose={() => setForwardingMessage(null)} />}
      <audio ref={audioRef} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === authUser._id;
          
          return (
            <div
              key={message._id}
              className={`chat ${isOwnMessage ? "chat-end" : "chat-start"} group relative`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isOwnMessage
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                  {message.isEdited && <span className="ml-1 text-xs opacity-50">(edited)</span>}
                </time>
              </div>
              <div className="relative">
                <div className="chat-bubble flex flex-col">
                  {message.replyTo && (
                    <div className="bg-base-300/50 p-2 rounded mb-2 text-xs border-l-2 border-primary">
                      <span className="font-semibold opacity-70">Replying to</span>
                      <p className="opacity-60 mt-1">{message.replyTo.text?.substring(0, 50)}{message.replyTo.text?.length > 50 ? '...' : ''}</p>
                    </div>
                  )}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  )}
                  {message.video && (
                    <video
                      src={message.video.url}
                      controls
                      className="sm:max-w-[300px] rounded-md mb-2"
                    />
                  )}
                  {message.voice && (
                    <div className="flex items-center gap-2 p-2 bg-base-300/50 rounded mb-2">
                      <button
                        onClick={() => toggleVoicePlay(message.voice.url, message._id)}
                        className="btn btn-circle btn-sm"
                      >
                        {playingVoice === message._id ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <div className="flex-1 h-1 bg-base-300 rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs">{message.voice.duration}s</span>
                    </div>
                  )}
                  {message.file && (
                    <a
                      href={message.file.url}
                      download={message.file.name}
                      className="flex items-center gap-2 p-2 bg-base-300/50 rounded mb-2 hover:bg-base-300 transition-colors"
                    >
                      <Download size={16} />
                      <span className="text-sm truncate max-w-[150px]">{message.file.name}</span>
                    </a>
                  )}
                  {message.text && <p className={message.isDeleted ? "italic opacity-50" : ""}>{message.text}</p>}
                  {isOwnMessage && message.readBy && message.readBy.length > 0 && (
                    <div className="flex justify-end mt-1">
                      <CheckCheck size={14} className="text-primary" />
                    </div>
                  )}
                  {isOwnMessage && (!message.readBy || message.readBy.length === 0) && (
                    <div className="flex justify-end mt-1">
                      <Check size={14} className="opacity-50" />
                    </div>
                  )}
                </div>
                
                {message.isPinned && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <Pin size={12} className="text-warning fill-warning" />
                  </div>
                )}

                {!message.isDeleted && (
                  <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 px-2`}>
                    <button
                      onClick={() => setShowEmojiPicker(showEmojiPicker === message._id ? null : message._id)}
                      className="btn btn-xs btn-circle btn-ghost hover:bg-base-300"
                      title="React"
                    >
                      <Smile size={14} />
                    </button>
                    <button
                      onClick={() => setReplyingTo(message)}
                      className="btn btn-xs btn-circle btn-ghost hover:bg-base-300"
                      title="Reply"
                    >
                      <Reply size={14} />
                    </button>
                    <button
                      onClick={() => pinMessage(message._id)}
                      className="btn btn-xs btn-circle btn-ghost hover:bg-base-300"
                      title={message.isPinned ? "Unpin" : "Pin"}
                    >
                      <Pin size={14} className={message.isPinned ? "fill-current" : ""} />
                    </button>
                    <button
                      onClick={() => setForwardingMessage(message)}
                      className="btn btn-xs btn-circle btn-ghost hover:bg-base-300"
                      title="Forward"
                    >
                      <Forward size={14} />
                    </button>
                    {isOwnMessage && (
                      <>
                        <button
                          onClick={() => setEditingMessage(message)}
                          className="btn btn-xs btn-circle btn-ghost hover:bg-base-300"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteMessage(message._id)}
                          className="btn btn-xs btn-circle btn-ghost hover:bg-error hover:text-error-content"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {showEmojiPicker === message._id && (
                  <div className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} top-full mt-2 bg-base-200 p-2 rounded-lg shadow-xl border border-base-300 flex gap-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          addReaction(message._id, emoji);
                          setShowEmojiPicker(null);
                        }}
                        className="btn btn-sm btn-ghost text-xl hover:scale-125 transition-transform duration-150"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {message.reactions && message.reactions.length > 0 && (
                  <div className={`flex gap-1 mt-1 flex-wrap ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    {message.reactions.map((reaction, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (reaction.userId === authUser._id) {
                            removeReaction(message._id);
                          }
                        }}
                        className={`text-sm px-2 py-0.5 rounded-full bg-base-300 hover:bg-base-200 transition-all duration-150 ${
                          reaction.userId === authUser._id ? 'ring-1 ring-primary scale-105' : ''
                        }`}
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {typingUsers.size > 0 && (
          <div className="chat chat-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="chat-bubble bg-base-300">
              <div className="flex gap-1 items-end h-4">
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDuration: '1s' }}></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDuration: '1s', animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDuration: '1s', animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;