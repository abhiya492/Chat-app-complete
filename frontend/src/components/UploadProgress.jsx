import { X } from "lucide-react";

const UploadProgress = ({ progress, fileName, onCancel }) => {
  return (
    <div className="fixed bottom-20 right-4 bg-base-100 shadow-xl rounded-lg p-4 w-80 border border-base-300 z-50 animate-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium truncate flex-1">{fileName}</span>
        {onCancel && (
          <button onClick={onCancel} className="btn btn-ghost btn-xs btn-circle">
            <X size={14} />
          </button>
        )}
      </div>
      <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
        <div className="bg-primary h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <div className="text-xs text-base-content/60 mt-1">{progress}% uploaded</div>
    </div>
  );
};

export default UploadProgress;
