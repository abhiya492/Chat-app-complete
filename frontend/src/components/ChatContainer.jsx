import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import MessageSearch from "./MessageSearch";
import ForwardModal from "./ForwardModal";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Smile, Reply, Edit2, Trash2, Download, Pin, Forward, Check, CheckCheck, Play, Pause } from "lucide-react";
import SmartReplies from "./SmartReplies";
import MessageTranslator from "./MessageTranslator";
import SentimentIndicator from "./SentimentIndicator";
import SharedExperiencePanel from "./SharedExperiences/SharedExperiencePanel";
import LazyImage from "./LazyImage";
import LazyVideo from "./LazyVideo";
import Message from "./Message";
import RetryButton from "./RetryButton";

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
    loadMoreMessages,
    hasMoreMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [playingVoice, setPlayingVoice] = useState(null);
  const audioRef = useRef(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  const toggleVoicePlay = useCallback(async (voiceUrl, messageId) => {
    if (playingVoice === messageId) {
      audioRef.current?.pause();
      setPlayingVoice(null);
    } else {
      if (audioRef.current) {
        try {
          console.log('🔊 Playing voice:', voiceUrl);
          audioRef.current.src = voiceUrl;
          audioRef.current.load();
          await audioRef.current.play();
          setPlayingVoice(messageId);
          audioRef.current.onended = () => setPlayingVoice(null);
          audioRef.current.onerror = (e) => {
            console.error('❌ Audio error:', e);
            setPlayingVoice(null);
          };
        } catch (error) {
          console.error('❌ Audio play error:', error);
          setPlayingVoice(null);
        }
      }
    }
  }, [playingVoice]);

  useEffect(() => {
    if (messageEndRef.current && messages && !isLoadingMore) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoadingMore]);

  const handleScroll = useCallback(async (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMoreMessages && !isMessagesLoading) {
      setIsLoadingMore(true);
      const prevHeight = messagesContainerRef.current?.scrollHeight || 0;
      try {
        await loadMoreMessages();
        setTimeout(() => {
          if (messagesContainerRef.current) {
            const newHeight = messagesContainerRef.current.scrollHeight;
            messagesContainerRef.current.scrollTop = newHeight - prevHeight;
          }
          setIsLoadingMore(false);
        }, 100);
      } catch (error) {
        console.error('Failed to load more messages:', error);
        setIsLoadingMore(false);
      }
    }
  }, [hasMoreMessages, isMessagesLoading, loadMoreMessages]);

  if (isMessagesLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col overflow-auto w-full">
        <ChatHeader onSearchClick={() => {}} onPinnedClick={() => {}} />
        <MessageSkeleton />
      </div>
    );
  }

  if (!isMessagesLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <p className="text-base-content/60 mb-4">Failed to load messages</p>
        <RetryButton onRetry={() => getMessages(selectedUser._id)} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 flex flex-col overflow-auto w-full">
      <ChatHeader 
        onSearchClick={() => setShowSearch(true)}
        onPinnedClick={() => {
          useChatStore.getState().getPinnedMessages(selectedUser._id);
        }}
      />

      {showSearch && <MessageSearch onClose={() => setShowSearch(false)} />}
      {forwardingMessage && <ForwardModal message={forwardingMessage} onClose={() => setForwardingMessage(null)} />}
      <audio ref={audioRef} />

      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <span className="loading loading-spinner loading-sm"></span>
          </div>
        )}
        {messages.map((message) => (
          <Message
            key={message._id}
            message={message}
            isOwnMessage={message.senderId === authUser._id}
            authUser={authUser}
            selectedUser={selectedUser}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            emojis={emojis}
            addReaction={addReaction}
            removeReaction={removeReaction}
            setReplyingTo={setReplyingTo}
            pinMessage={pinMessage}
            setForwardingMessage={setForwardingMessage}
            setEditingMessage={setEditingMessage}
            deleteMessage={deleteMessage}
            playingVoice={playingVoice}
            toggleVoicePlay={toggleVoicePlay}
          />
        ))}
        
        {typingUsers.size > 0 && (
          <motion.div className="chat chat-start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <div className="chat-bubble bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 shadow-lg">
              <div className="flex gap-1 items-end h-4">
                <motion.span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" animate={{ y: [-2, 2, -2] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />
                <motion.span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" animate={{ y: [-2, 2, -2] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
                <motion.span className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" animate={{ y: [-2, 2, -2] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <MessageInput />
      </div>
      
      <SharedExperiencePanel />
    </div>
  );
};
export default ChatContainer;
