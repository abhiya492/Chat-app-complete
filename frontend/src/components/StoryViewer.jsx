import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useStoryStore } from "../store/useStoryStore";

const StoryViewer = () => {
  const { selectedStory, currentStoryIndex, nextStory, previousStory, closeStoryViewer, viewStory } = useStoryStore();
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = selectedStory?.stories[currentStoryIndex];

  useEffect(() => {
    if (!currentStory) return;

    viewStory(currentStory._id);

    const duration = currentStory.duration * 1000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      if (!isPaused) {
        elapsed += interval;
        setProgress((elapsed / duration) * 100);

        if (elapsed >= duration) {
          nextStory();
          setProgress(0);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [currentStory, isPaused, nextStory, viewStory]);

  if (!selectedStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {selectedStory.stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all" style={{ width: idx === currentStoryIndex ? `${progress}%` : idx < currentStoryIndex ? "100%" : "0%" }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <img src={selectedStory.user.profilePic || "/avatar.png"} alt={selectedStory.user.fullName} className="w-10 h-10 rounded-full" />
          <span className="text-white font-semibold">{selectedStory.user.fullName}</span>
        </div>
        <button onClick={closeStoryViewer} className="text-white">
          <X size={24} />
        </button>
      </div>

      {/* Story content */}
      <div className="relative w-full max-w-md h-full flex items-center justify-center" onClick={() => setIsPaused(!isPaused)}>
        {currentStory?.type === "image" && (
          <img src={currentStory.content.url} alt="Story" className="w-full h-full object-contain" />
        )}
        {currentStory?.type === "video" && (
          <video src={currentStory.content.url} className="w-full h-full object-contain" autoPlay muted />
        )}
        {currentStory?.type === "text" && (
          <div className="w-full h-full flex items-center justify-center p-8" style={{ backgroundColor: currentStory.content.backgroundColor }}>
            <p className="text-3xl text-center" style={{ color: currentStory.content.textColor }}>{currentStory.content.text}</p>
          </div>
        )}

        {/* Caption */}
        {currentStory?.caption && (
          <div className="absolute bottom-20 left-4 right-4 text-white text-center bg-black/50 p-2 rounded">
            {currentStory.caption}
          </div>
        )}

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Pause size={48} className="text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <button onClick={previousStory} className="absolute left-4 top-1/2 -translate-y-1/2 text-white">
        <ChevronLeft size={32} />
      </button>
      <button onClick={nextStory} className="absolute right-4 top-1/2 -translate-y-1/2 text-white">
        <ChevronRight size={32} />
      </button>
    </div>
  );
};

export default StoryViewer;
