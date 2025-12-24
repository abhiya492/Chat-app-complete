import { useState, useRef, useEffect } from "react";
import { Video, VideoOff, Play, Square, Upload } from "lucide-react";
import { useAccessibilityStore } from "../store/useAccessibilityStore";
import toast from "react-hot-toast";

const SignLanguageVideo = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  
  const { signLanguage, setSignLanguage } = useAccessibilityStore();

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }, 
        audio: false 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideo(videoUrl);
        
        // Stop camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setSignLanguage({ recordingVideo: true });
      toast.success("Recording sign language video...");
      
    } catch (error) {
      console.error("Error starting video recording:", error);
      toast.error("Failed to access camera. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setSignLanguage({ recordingVideo: false });
      toast.success("Video recorded successfully!");
    }
  };

  const playRecordedVideo = () => {
    if (recordedVideo && videoRef.current) {
      videoRef.current.src = recordedVideo;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopPlayback = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      setRecordedVideo(videoUrl);
      toast.success("Video uploaded successfully!");
    } else {
      toast.error("Please select a valid video file");
    }
  };

  const clearVideo = () => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
      setRecordedVideo(null);
    }
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.src = "";
    }
  };

  if (!signLanguage.enabled) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-base-content/70 mb-4">
        Record or upload sign language videos to communicate with others.
      </div>

      {/* Video Display */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay={isRecording}
          muted={isRecording}
          playsInline
          onEnded={() => setIsPlaying(false)}
        />
        
        {!isRecording && !recordedVideo && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">No video</p>
            </div>
          </div>
        )}

        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Recording
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        {!isRecording && !recordedVideo && (
          <button
            onClick={startRecording}
            className="btn btn-sm btn-primary"
          >
            <Video className="w-4 h-4" />
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="btn btn-sm btn-error"
          >
            <Square className="w-4 h-4" />
            Stop Recording
          </button>
        )}

        {recordedVideo && !isPlaying && (
          <button
            onClick={playRecordedVideo}
            className="btn btn-sm btn-success"
          >
            <Play className="w-4 h-4" />
            Play Video
          </button>
        )}

        {isPlaying && (
          <button
            onClick={stopPlayback}
            className="btn btn-sm btn-warning"
          >
            <Square className="w-4 h-4" />
            Stop Playback
          </button>
        )}

        {recordedVideo && (
          <button
            onClick={clearVideo}
            className="btn btn-sm btn-ghost"
          >
            Clear Video
          </button>
        )}

        {/* File Upload */}
        <label className="btn btn-sm btn-outline">
          <Upload className="w-4 h-4" />
          Upload Video
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Instructions */}
      <div className="text-xs text-base-content/60 space-y-1">
        <p>• Record sign language messages for better communication</p>
        <p>• Videos are stored locally and not uploaded to servers</p>
        <p>• Supported formats: WebM, MP4, MOV</p>
      </div>

      {/* Browser Support Check */}
      {!navigator.mediaDevices?.getUserMedia && (
        <div className="alert alert-warning">
          <VideoOff className="w-5 h-5" />
          <span>Camera access not supported in this browser</span>
        </div>
      )}
    </div>
  );
};

export default SignLanguageVideo;