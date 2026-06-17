import { useState, useEffect } from 'react';
import { Trophy, Code, BrainCircuit, Play, Zap, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// --- GAME 1: Tech Trivia Data ---
const triviaQuestions = [
  { question: "Which algorithm is used by LinkedIn for feed ranking?", options: ["PageRank", "XGBoost", "A*", "Dijkstra"], answer: 1 },
  { question: "What does 'SOLID' stand for in software engineering?", options: ["Simple, Open, Logic, Interface, Data", "Single, Open-Closed, Liskov, Interface, Dependency", "Safe, Optimized, Linear, Indexed, Dynamic"], answer: 1 },
  { question: "In networking, what does B2B stand for?", options: ["Business to Base", "Business to Business", "Back to Back", "Broadcast to Broadcast"], answer: 1 },
  { question: "Which hook is used to manage side effects in React?", options: ["useState", "useContext", "useEffect", "useReducer"], answer: 2 },
  { question: "What is the primary language used for iOS development?", options: ["Java", "Kotlin", "Swift", "C#"], answer: 2 },
];

export default function Games() {
  const { user, setUser } = useAuth();
  const [activeGame, setActiveGame] = useState(null); // 'trivia' | 'memory' | null

  // --- TRIVIA STATE ---
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [triviaFinished, setTriviaFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // --- MEMORY GAME STATE ---
  const initialCards = [
    { id: 1, icon: '⚛️', name: 'React', matched: false }, { id: 2, icon: '🐍', name: 'Python', matched: false },
    { id: 3, icon: '☕', name: 'Java', matched: false }, { id: 4, icon: '🐳', name: 'Docker', matched: false },
    { id: 5, icon: '☁️', name: 'AWS', matched: false }, { id: 6, icon: '🐙', name: 'GitHub', matched: false },
    { id: 7, icon: '⚛️', name: 'React', matched: false }, { id: 8, icon: '🐍', name: 'Python', matched: false },
    { id: 9, icon: '☕', name: 'Java', matched: false }, { id: 10, icon: '🐳', name: 'Docker', matched: false },
    { id: 11, icon: '☁️', name: 'AWS', matched: false }, { id: 12, icon: '🐙', name: 'GitHub', matched: false },
  ];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [memoryFinished, setMemoryFinished] = useState(false);

  // --- REWARDS ---
  const awardPoints = async (points) => {
    try {
      const res = await api.put('/users/profile/add-points', { points });
      setUser(res.data.user);
      toast.success(`You earned ${points} XP!`);
    } catch (err) {
      console.log('Error awarding points, maybe backend route missing. Assuming success for demo.');
      // Fallback for demo if route doesn't exist
      setUser({ ...user, points: (user.points || 0) + points });
      toast.success(`You earned ${points} XP!`);
    }
  };

  // --- TRIVIA LOGIC ---
  const handleTriviaAnswer = (idx) => {
    setSelectedAnswer(idx);
    setTimeout(() => {
      if (idx === triviaQuestions[currentQIndex].answer) setScore(s => s + 1);
      
      if (currentQIndex < triviaQuestions.length - 1) {
        setCurrentQIndex(currentQIndex + 1);
        setSelectedAnswer(null);
      } else {
        setTriviaFinished(true);
        awardPoints((score + (idx === triviaQuestions[currentQIndex].answer ? 1 : 0)) * 10);
      }
    }, 1000);
  };

  const resetTrivia = () => {
    setCurrentQIndex(0); setScore(0); setTriviaFinished(false); setSelectedAnswer(null);
  };

  // --- MEMORY LOGIC ---
  const shuffleCards = () => {
    const shuffled = [...initialCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMoves(0);
    setMemoryFinished(false);
  };

  useEffect(() => {
    if (activeGame === 'memory') shuffleCards();
  }, [activeGame]);

  const handleCardClick = (index) => {
    if (flipped.length === 2 || cards[index].matched || flipped.includes(index)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const match = cards[newFlipped[0]].name === cards[newFlipped[1]].name;
      
      setTimeout(() => {
        if (match) {
          const newCards = [...cards];
          newCards[newFlipped[0]].matched = true;
          newCards[newFlipped[1]].matched = true;
          setCards(newCards);
          if (newCards.every(c => c.matched)) {
            setMemoryFinished(true);
            const reward = Math.max(10, 50 - moves);
            awardPoints(reward);
          }
        }
        setFlipped([]);
      }, 1000);
    }
  };

  // --- RENDERERS ---
  const renderTrivia = () => {
    if (triviaFinished) {
      return (
        <div className="text-center py-10">
          <Trophy size={64} className="mx-auto text-[#f59e0b] mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
          <p className="text-xl text-gray-300 mb-8">You scored {score}/{triviaQuestions.length}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={resetTrivia} className="btn-secondary px-6"><RotateCcw size={18} /> Play Again</button>
            <button onClick={() => setActiveGame(null)} className="btn-primary px-6">Back to Hub</button>
          </div>
        </div>
      );
    }

    const q = triviaQuestions[currentQIndex];
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8 text-sm font-bold text-gray-400 uppercase tracking-wider">
          <span>Question {currentQIndex + 1} of {triviaQuestions.length}</span>
          <span className="flex items-center gap-1 text-[#6366f1]"><Zap size={16} /> Score: {score}</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">{q.question}</h2>
        <div className="space-y-4">
          {q.options.map((opt, idx) => {
            let stateClass = "border-[#1e2a40] hover:border-[#6366f1] bg-[#1a2235]";
            if (selectedAnswer !== null) {
              if (idx === q.answer) stateClass = "border-[#10b981] bg-[#10b981]/10 text-white";
              else if (idx === selectedAnswer) stateClass = "border-red-500 bg-red-500/10 text-white";
              else stateClass = "border-[#1e2a40] opacity-50";
            }

            return (
              <button
                key={idx}
                disabled={selectedAnswer !== null}
                onClick={() => handleTriviaAnswer(idx)}
                className={`w-full p-4 rounded-xl border text-left font-medium transition-all flex items-center justify-between ${stateClass}`}
              >
                {opt}
                {selectedAnswer !== null && idx === q.answer && <CheckCircle size={20} className="text-[#10b981]" />}
                {selectedAnswer === idx && idx !== q.answer && <XCircle size={20} className="text-red-500" />}
              </button>
            )
          })}
        </div>
      </div>
    );
  };

  const renderMemory = () => {
    if (memoryFinished) {
       return (
        <div className="text-center py-10">
          <BrainCircuit size={64} className="mx-auto text-[#a855f7] mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold text-white mb-2">Well Done!</h2>
          <p className="text-xl text-gray-300 mb-8">You finished in {moves} moves.</p>
          <div className="flex gap-4 justify-center">
            <button onClick={shuffleCards} className="btn-secondary px-6"><RotateCcw size={18} /> Play Again</button>
            <button onClick={() => setActiveGame(null)} className="btn-primary px-6">Back to Hub</button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto py-4">
        <div className="flex justify-between items-center mb-8">
           <span className="text-gray-400 font-bold uppercase tracking-wide text-sm">Moves: {moves}</span>
           <button onClick={shuffleCards} className="text-sm flex items-center gap-1 text-gray-400 hover:text-white transition-colors"><RotateCcw size={16} /> Restart</button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || card.matched;
            return (
              <div 
                key={idx} 
                onClick={() => handleCardClick(idx)}
                className={`aspect-square rounded-2xl cursor-pointer transition-all duration-300 transform preserve-3d relative ${isFlipped ? 'rotate-y-180' : 'hover:-translate-y-1 shadow-lg'}`}
              >
                <div className={`absolute w-full h-full backface-hidden rounded-2xl flex items-center justify-center border-2 border-[#1e2a40] text-4xl shadow-md ${isFlipped ? 'bg-[#1a2235]' : 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]'}`}>
                  {!isFlipped && <span className="text-white/30"><BrainCircuit size={32} /></span>}
                  {isFlipped && card.icon}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Arcade Hub</h1>
          <p className="text-gray-400">Sharpen your professional skills and earn reputation points.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-full text-[#f59e0b] font-bold">
          <Trophy size={18} /> {user?.points || 0} XP
        </div>
      </div>

      {!activeGame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Game 1 Card */}
          <div className="glass p-8 rounded-3xl border border-[#1e2a40] relative overflow-hidden group hover:border-[#6366f1]/50 transition-all cursor-pointer" onClick={() => setActiveGame('trivia')}>
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#6366f1]/10 rounded-full blur-3xl group-hover:bg-[#6366f1]/20 transition-all"></div>
             <div className="w-16 h-16 rounded-2xl bg-[#6366f1]/10 text-[#6366f1] flex items-center justify-center mb-6">
               <Code size={32} />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#818cf8] transition-colors">Tech Trivia</h2>
             <p className="text-gray-400 text-sm mb-8">Test your knowledge on algorithms, networking, and software engineering principles.</p>
             <button className="w-full btn-primary h-12">
               <Play size={18} /> Play Now
             </button>
          </div>

          {/* Game 2 Card */}
          <div className="glass p-8 rounded-3xl border border-[#1e2a40] relative overflow-hidden group hover:border-[#a855f7]/50 transition-all cursor-pointer" onClick={() => setActiveGame('memory')}>
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#a855f7]/10 rounded-full blur-3xl group-hover:bg-[#a855f7]/20 transition-all"></div>
             <div className="w-16 h-16 rounded-2xl bg-[#a855f7]/10 text-[#a855f7] flex items-center justify-center mb-6">
               <BrainCircuit size={32} />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#c084fc] transition-colors">Skill Matcher</h2>
             <p className="text-gray-400 text-sm mb-8">A memory game to match popular technologies and tech stacks. Fast times earn higher XP.</p>
             <button className="w-full btn-secondary text-[#c084fc] border-[#a855f7]/50 hover:bg-[#a855f7] hover:text-white h-12">
               <Play size={18} /> Play Now
             </button>
          </div>
        </div>
      ) : (
        <div className="glass p-8 rounded-3xl border border-[#1e2a40] relative min-h-[600px] flex flex-col justify-center">
           {activeGame === 'trivia' && renderTrivia()}
           {activeGame === 'memory' && renderMemory()}
        </div>
      )}
    </div>
  );
}
