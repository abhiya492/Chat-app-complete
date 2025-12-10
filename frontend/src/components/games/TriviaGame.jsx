import { useState, useEffect } from "react";
import { Brain, Clock, Trophy, Zap, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const TRIVIA_QUESTIONS = [
  { q: "What is the capital of France?", a: ["Paris", "London", "Berlin", "Madrid"], correct: 0, category: "Geography" },
  { q: "Who painted the Mona Lisa?", a: ["Leonardo da Vinci", "Michelangelo", "Raphael", "Donatello"], correct: 0, category: "Art" },
  { q: "What is 15 × 8?", a: ["120", "110", "130", "100"], correct: 0, category: "Math" },
  { q: "Which planet is known as the Red Planet?", a: ["Mars", "Venus", "Jupiter", "Saturn"], correct: 0, category: "Science" },
  { q: "Who wrote 'Romeo and Juliet'?", a: ["William Shakespeare", "Charles Dickens", "Jane Austen", "Mark Twain"], correct: 0, category: "Literature" },
  { q: "What is the largest ocean on Earth?", a: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], correct: 0, category: "Geography" },
  { q: "In which year did World War II end?", a: ["1945", "1944", "1946", "1943"], correct: 0, category: "History" },
  { q: "What is the chemical symbol for gold?", a: ["Au", "Ag", "Fe", "Cu"], correct: 0, category: "Science" },
  { q: "Which programming language is known as the 'language of the web'?", a: ["JavaScript", "Python", "Java", "C++"], correct: 0, category: "Technology" },
  { q: "How many continents are there?", a: ["7", "5", "6", "8"], correct: 0, category: "Geography" },
];

const TriviaGame = ({ challenge, authUser, opponent, socket, onGameEnd }) => {
  const [gameState, setGameState] = useState({
    scores: { [authUser._id]: 0, [opponent._id]: 0 },
    currentQuestion: 0,
    currentTurn: challenge.challengerId._id,
    answered: false,
    timeLeft: 15,
  });

  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState([]);

  const isMyTurn = gameState.currentTurn === authUser._id;
  const currentQ = questions[gameState.currentQuestion];
  const myScore = gameState.scores[authUser._id];
  const opponentScore = gameState.scores[opponent._id];

  useEffect(() => {
    const shuffled = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);

    socket.on("trivia:answer", ({ data }) => {
      if (data.newState) setGameState(data.newState);
      if (data.history) setHistory(prev => [...prev, data.history]);
      if (data.gameOver) {
        setTimeout(() => onGameEnd(data.winner), 3000);
        toast.success(data.winner === authUser._id ? "🏆 You Won!" : "🎯 Good Game!");
      }
    });

    return () => socket.off("trivia:answer");
  }, []);

  useEffect(() => {
    if (!isMyTurn || gameState.answered) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          handleAnswer(null);
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMyTurn, gameState.answered, gameState.currentQuestion]);

  const handleAnswer = (answerIndex) => {
    if (!isMyTurn || gameState.answered) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === currentQ.correct;
    const newState = { ...gameState };
    
    if (isCorrect) {
      newState.scores[authUser._id] += 1;
    }

    const historyEntry = {
      player: authUser.fullName,
      question: currentQ.q,
      answer: answerIndex !== null ? currentQ.a[answerIndex] : "Time's up!",
      correct: isCorrect,
    };

    newState.answered = true;

    setTimeout(() => {
      newState.currentQuestion += 1;
      newState.currentTurn = opponent._id;
      newState.answered = false;
      newState.timeLeft = 15;

      const gameOver = newState.currentQuestion >= questions.length;
      const winner = gameOver ? (newState.scores[authUser._id] > newState.scores[opponent._id] ? authUser._id : opponent._id) : null;

      socket.emit("trivia:answer", {
        gameRoomId: challenge.gameRoomId,
        data: { newState, history: historyEntry, gameOver, winner }
      });

      setGameState(newState);
      setSelectedAnswer(null);
      setShowResult(false);
      setHistory(prev => [...prev, historyEntry]);

      if (gameOver) {
        setTimeout(() => onGameEnd(winner), 3000);
      }
    }, 2000);
  };

  if (!currentQ) {
    return (
      <div className="text-center py-12">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="stats shadow">
          <div className="stat p-4">
            <div className="stat-title text-xs">Your Score</div>
            <div className="stat-value text-2xl text-primary">{myScore}</div>
          </div>
          <div className="stat p-4">
            <div className="stat-title text-xs">{opponent.fullName}</div>
            <div className="stat-value text-2xl text-secondary">{opponentScore}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className={`text-2xl font-bold ${gameState.timeLeft <= 5 ? 'text-error animate-pulse' : ''}`}>
            {gameState.timeLeft}s
          </span>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <span className="badge badge-primary">{currentQ.category}</span>
            <span className="text-sm">Question {gameState.currentQuestion + 1}/{questions.length}</span>
          </div>
          <h3 className="text-xl font-bold mb-4">{currentQ.q}</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {currentQ.a.map((answer, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={!isMyTurn || gameState.answered}
                className={`btn btn-lg justify-start text-left h-auto py-4 ${
                  showResult && idx === currentQ.correct ? 'btn-success' :
                  showResult && idx === selectedAnswer && idx !== currentQ.correct ? 'btn-error' :
                  'btn-outline'
                }`}
              >
                <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                {answer}
                {showResult && idx === currentQ.correct && <CheckCircle className="w-5 h-5 ml-auto" />}
                {showResult && idx === selectedAnswer && idx !== currentQ.correct && <XCircle className="w-5 h-5 ml-auto" />}
              </button>
            ))}
          </div>

          {!isMyTurn && (
            <div className="alert alert-info mt-4">
              <Zap className="w-5 h-5" />
              <span>Waiting for {opponent.fullName} to answer...</span>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <h3 className="font-bold text-sm mb-2">📊 History</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.map((entry, idx) => (
                <div key={idx} className={`text-xs p-2 rounded ${entry.correct ? 'bg-success/20' : 'bg-error/20'}`}>
                  <div className="font-bold">{entry.player}</div>
                  <div className="opacity-70">{entry.answer} {entry.correct ? '✓' : '✗'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TriviaGame;
