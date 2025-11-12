import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

const SmartReplies = ({ lastMessage, onSelectReply }) => {
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    if (lastMessage?.text && lastMessage.senderId !== lastMessage._id) {
      fetchReplies(lastMessage.text);
    }
  }, [lastMessage?._id]);

  const fetchReplies = async (text) => {
    try {
      const res = await axiosInstance.post('/ai/smart-replies', { messageText: text });
      setReplies(res.data.replies);
    } catch (error) {
      console.error('Smart replies error:', error);
    }
  };

  if (!replies.length) return null;

  return (
    <div className="flex gap-2 p-2 overflow-x-auto">
      {replies.map((reply, idx) => (
        <button
          key={idx}
          onClick={() => onSelectReply(reply)}
          className="px-3 py-1 bg-base-200 hover:bg-base-300 rounded-full text-sm whitespace-nowrap"
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

export default SmartReplies;
