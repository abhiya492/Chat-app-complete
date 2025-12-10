import { useState, useEffect } from "react";
import { BookOpen, Send, Star, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const STORY_PROMPTS = [
  "Once upon a time in a magical kingdom...",
  "In a distant galaxy far from Earth...",
  "Deep in the enchanted forest...",
  "On a stormy night in an old mansion...",
  "In the year 2150, humanity discovered...",
];

const StoryGame = ({ challenge, authUser, opponent, socket, onGameEnd }) => {
  const [story, setStory] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [gameState, setGameState] = useState({
    currentTurn: challenge.challengerId._id,
    round: 1,
    maxRounds: 10,
  });
  const [votes, setVotes] = useState({ [authUser._id]: 0, [opponent._id]: 0 });
  const [showVoting, setShowVoting] = useState(false);

  const isMyTurn = gameState.currentTurn === authUser._id;

  useEffect(() => {
    const prompt = STORY_PROMPTS[Math.floor(Math.random() * STORY_PROMPTS.length)];
    setStory([{ text: prompt, author: 'system', timestamp: Date.now() }]);

    socket.on("story:add", ({ data }) => {
      setStory(prev => [...prev, data.entry]);
      setGameState(data.newState);
      if (data.gameOver) {
        setShowVoting(true);
      }
    });

    socket.on("story:vote", ({ voterId }) => {
      setVotes(prev => ({ ...prev, [voterId]: (prev[voterId] || 0) + 1 }));
    });

    return () => {
      socket.off("story:add");
      socket.off("story:vote");
    };
  }, []);

  const addToStory = () => {
    if (!currentInput.trim() || !isMyTurn) return;

    const entry = {
      text: currentInput,
      author: authUser.fullName,
      authorId: authUser._id,
      timestamp: Date.now(),
    };

    const newState = {
      ...gameState,
      currentTurn: opponent._id,
      round: gameState.round + 0.5,
    };

    const gameOver = newState.round >= gameState.maxRounds;

    socket.emit("story:add", {
      gameRoomId: challenge.gameRoomId,
      data: { entry, newState, gameOver }
    });

    setStory(prev => [...prev, entry]);
    setGameState(newState);
    setCurrentInput("");

    if (gameOver) {
      setShowVoting(true);
    }
  };

  const voteForStory = (playerId) => {
    socket.emit("story:vote", {
      gameRoomId: challenge.gameRoomId,
      voterId: authUser._id,
      votedFor: playerId
    });
    
    toast.success("Vote submitted!");
    setTimeout(() => {
      const winner = votes[authUser._id] > votes[opponent._id] ? authUser._id : opponent._id;
      onGameEnd(winner);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h3 className="font-bold">Collaborative Story</h3>
        </div>
        <span className="badge badge-lg">
          Round {Math.ceil(gameState.round)}/{gameState.maxRounds}
        </span>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="prose max-w-none">
            <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-base-200 rounded-lg">
              {story.map((entry, idx) => (
                <div key={idx} className={`${
                  entry.author === 'system' ? 'text-center italic text-primary font-bold text-lg' :
                  entry.authorId === authUser._id ? 'bg-primary/10 p-3 rounded-r-lg border-l-4 border-primary' :
                  'bg-secondary/10 p-3 rounded-l-lg border-r-4 border-secondary'
                }`}>
                  {entry.author !== 'system' && (
                    <div className="text-xs font-bold mb-1 opacity-70">{entry.author}</div>
                  )}
                  <p className="text-sm leading-relaxed">{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!showVoting ? (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            {isMyTurn ? (
              <>
                <h4 className="font-bold text-sm mb-2">✍️ Your Turn - Add to the story</h4>
                <div className="flex gap-2">
                  <textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addToStory())}
                    placeholder="Continue the story... (2-3 sentences)"
                    className="textarea textarea-bordered flex-1 h-24"
                    maxLength={200}
                  />
                  <button
                    onClick={addToStory}
                    disabled={!currentInput.trim()}
                    className="btn btn-primary gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="text-xs text-right opacity-70">{currentInput.length}/200</div>
              </>
            ) : (
              <div className="alert alert-info">
                <Sparkles className="w-5 h-5" />
                <span>Waiting for {opponent.fullName} to continue the story...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-warning" />
              Vote for the Best Contributor!
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => voteForStory(authUser._id)}
                className="btn btn-lg btn-outline flex-col h-auto py-4"
              >
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    <img src={authUser.profilePic || "/avatar.png"} alt={authUser.fullName} />
                  </div>
                </div>
                <span className="font-bold">{authUser.fullName}</span>
                <span className="text-xs">Vote for yourself</span>
              </button>
              <button
                onClick={() => voteForStory(opponent._id)}
                className="btn btn-lg btn-outline flex-col h-auto py-4"
              >
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    <img src={opponent.profilePic || "/avatar.png"} alt={opponent.fullName} />
                  </div>
                </div>
                <span className="font-bold">{opponent.fullName}</span>
                <span className="text-xs">Vote for opponent</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryGame;
