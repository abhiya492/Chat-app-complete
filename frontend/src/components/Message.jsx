import { memo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Smile, Reply, Edit2, Trash2, Download, Pin, Forward, Check, CheckCheck, Play, Pause, Shield } from 'lucide-react';
import { formatMessageTime } from '../lib/utils';
import LazyImage from './LazyImage';
import LazyVideo from './LazyVideo';

const Message = memo(({ 
  message, 
  isOwnMessage, 
  authUser, 
  selectedUser,
  showEmojiPicker,
  setShowEmojiPicker,
  emojis,
  addReaction,
  removeReaction,
  setReplyingTo,
  pinMessage,
  setForwardingMessage,
  setEditingMessage,
  deleteMessage,
  playingVoice,
  toggleVoicePlay
}) => {
  const prefersReducedMotion = useReducedMotion();

  const messageVariants = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      className={`chat ${isOwnMessage ? "chat-end" : "chat-start"} group relative message-send`}
    >
      <div className="chat-image avatar">
        <div className="size-8 sm:size-10 rounded-full border">
          <img
            src={isOwnMessage ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"}
            alt="profile pic"
          />
        </div>
      </div>
      <div className="chat-header mb-1">
        <time className="text-xs opacity-50 ml-1">
          {formatMessageTime(message.createdAt)}
          {message.isEdited && <span className="ml-1 text-xs opacity-50">(edited)</span>}
          {message.isEncrypted && <Shield size={10} className="inline ml-1 text-green-500" title="Encrypted" />}
        </time>
      </div>
      <div className="relative">
        <div className="chat-bubble flex flex-col message-bubble">
          {message.replyTo && (
            <div className="bg-base-300/50 p-2 rounded mb-2 text-xs border-l-2 border-primary">
              <span className="font-semibold opacity-70">Replying to</span>
              <p className="opacity-60 mt-1">{message.replyTo.text?.substring(0, 50)}{message.replyTo.text?.length > 50 ? '...' : ''}</p>
            </div>
          )}
          {message.image && (
            <LazyImage
              src={message.image}
              alt="Attachment"
              className="max-w-[150px] sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity"
            />
          )}
          {message.video && (
            <LazyVideo
              src={message.video.url}
              className="max-w-[200px] sm:max-w-[300px] rounded-md mb-2"
            />
          )}
          {message.voice && (
            <div className="flex items-center gap-2 p-2 bg-base-300/50 rounded mb-2">
              <button onClick={() => toggleVoicePlay(message.voice.url, message._id)} className="btn btn-circle btn-sm">
                {playingVoice === message._id ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <div className="flex-1 h-1 bg-base-300 rounded-full">
                <div className="h-full bg-primary rounded-full" style={{ width: '0%' }}></div>
              </div>
              <span className="text-xs">{message.voice.duration}s</span>
            </div>
          )}
          {message.file && (
            <a href={message.file.url} download={message.file.name} className="flex items-center gap-2 p-2 bg-base-300/50 rounded mb-2 hover:bg-base-300 transition-colors">
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
          <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-0.5 sm:gap-1 px-1 sm:px-2`}>
            <motion.button whileHover={{ scale: 1.2, rotate: 10, y: -2 }} whileTap={{ scale: 0.9 }} onClick={() => setShowEmojiPicker(showEmojiPicker === message._id ? null : message._id)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 flex items-center justify-center shadow-lg transition-all duration-200" title="React">
              <Smile size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.9 }} onClick={() => setReplyingTo(message)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 flex items-center justify-center shadow-lg transition-all duration-200" title="Reply">
              <Reply size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.9 }} onClick={() => pinMessage(message._id)} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${message.isPinned ? 'bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500' : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'}`} title={message.isPinned ? "Unpin" : "Pin"}>
              <Pin size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.9 }} onClick={() => setForwardingMessage(message)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 flex items-center justify-center shadow-lg transition-all duration-200" title="Forward">
              <Forward size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
            </motion.button>
            {isOwnMessage && (
              <>
                <motion.button whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.9 }} onClick={() => setEditingMessage(message)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 flex items-center justify-center shadow-lg transition-all duration-200" title="Edit">
                  <Edit2 size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.9 }} onClick={() => deleteMessage(message._id)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center shadow-lg transition-all duration-200" title="Delete">
                  <Trash2 size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
                </motion.button>
              </>
            )}
          </div>
        )}

        {showEmojiPicker === message._id && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} top-full mt-2 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-white/20 flex gap-2 z-50`}>
            {emojis.map((emoji, idx) => (
              <motion.button key={emoji} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: idx * 0.05 }} whileHover={{ scale: 1.4, rotate: 15, y: -5 }} whileTap={{ scale: 0.9 }} onClick={() => { addReaction(message._id, emoji); setShowEmojiPicker(null); }} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xl transition-all duration-200 backdrop-blur-sm">
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}

        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex gap-2 mt-2 flex-wrap ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            {message.reactions.map((reaction, idx) => (
              <motion.button key={idx} initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => { if (reaction.userId === authUser._id) { removeReaction(message._id); } }} className={`text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border transition-all duration-200 ${reaction.userId === authUser._id ? 'border-purple-400 shadow-lg shadow-purple-200' : 'border-gray-200'}`}>
                <span className="text-base">{reaction.emoji}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.message._id === nextProps.message._id &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.message.reactions?.length === nextProps.message.reactions?.length &&
    prevProps.message.readBy?.length === nextProps.message.readBy?.length &&
    prevProps.message.isPinned === nextProps.message.isPinned &&
    prevProps.showEmojiPicker === nextProps.showEmojiPicker &&
    prevProps.playingVoice === nextProps.playingVoice
  );
});

Message.displayName = 'Message';

export default Message;
