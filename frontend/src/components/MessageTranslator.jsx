import { useState } from 'react';
import { axiosInstance } from '../lib/axios';
import { Languages } from 'lucide-react';

const MessageTranslator = ({ message }) => {
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);

  const translate = async (lang) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/ai/translate', { 
        text: message.text, 
        targetLang: lang 
      });
      setTranslated(res.data.translated);
    } catch (error) {
      console.error('Translation error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="dropdown dropdown-top">
      <label tabIndex={0} className="btn btn-ghost btn-xs">
        <Languages size={14} />
      </label>
      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-32">
        <li><a onClick={() => translate('es')}>Spanish</a></li>
        <li><a onClick={() => translate('fr')}>French</a></li>
        <li><a onClick={() => translate('de')}>German</a></li>
        <li><a onClick={() => translate('hi')}>Hindi</a></li>
      </ul>
      {loading && <span className="loading loading-spinner loading-xs"></span>}
      {translated && (
        <div className="text-xs italic text-base-content/70 mt-1">
          {translated}
        </div>
      )}
    </div>
  );
};

export default MessageTranslator;
