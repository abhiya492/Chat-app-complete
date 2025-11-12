import { useState, useRef } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const VoiceRecorder = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const startTimeRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      streamRef.current = stream;
      
      const options = { mimeType: 'audio/webm' };
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current.mimeType });
        console.log('🎤 Recording stopped:', {
          duration,
          blobSize: blob.size,
          mimeType: blob.type,
          chunks: chunksRef.current.length
        });
        
        // Test playback locally first
        const audioUrl = URL.createObjectURL(blob);
        const testAudio = new Audio(audioUrl);
        testAudio.play().then(() => {
          console.log('✅ Local playback works!');
          testAudio.pause();
        }).catch(err => {
          console.error('❌ Local playback failed:', err);
        });
        
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('📦 Base64 length:', reader.result.length);
          onRecordingComplete({
            data: reader.result,
            duration: duration || 1,
          });
          setRecordingTime(0);
        };
        reader.readAsDataURL(blob);
        streamRef.current?.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(100); // Request data every 100ms
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (recordingTime < 1) {
        toast.error("Recording too short. Minimum 1 second.");
        return;
      }
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    streamRef.current?.getTracks().forEach(track => track.stop());
    onCancel();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg animate-in slide-in-from-bottom-2 duration-200">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="btn btn-circle btn-error"
        >
          <Mic size={20} />
        </button>
      ) : (
        <>
          <button
            onClick={stopRecording}
            className="btn btn-circle btn-success"
          >
            <Square size={20} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
            <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
          </div>
        </>
      )}
      <button
        onClick={cancelRecording}
        className="btn btn-circle btn-ghost"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default VoiceRecorder;