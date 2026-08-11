import React, { useState, useEffect } from "react";
import { Sparkles, Trophy, X, RotateCcw, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

export const NutNinjaGame: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { applyDiscount } = useCart();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nuts, setNuts] = useState<Array<{ id: number; top: number; left: number; emoji: string }>>([]);

  const NUT_EMOJIS = ["🥜", "🌰", "🍯", "🍫", "✨"];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setGameEnded(true);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    let nutInterval: NodeJS.Timeout;
    if (isPlaying) {
      nutInterval = setInterval(() => {
        const newNut = {
          id: Date.now(),
          top: Math.floor(Math.random() * 70) + 15,
          left: Math.floor(Math.random() * 75) + 10,
          emoji: NUT_EMOJIS[Math.floor(Math.random() * NUT_EMOJIS.length)],
        };
        setNuts((prev) => [...prev.slice(-4), newNut]);
      }, 700);
    }
    return () => clearInterval(nutInterval);
  }, [isPlaying]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setGameEnded(false);
    setIsPlaying(true);
    setNuts([]);
  };

  const sliceNut = (id: number) => {
    setScore((s) => s + 10);
    setNuts((prev) => prev.filter((n) => n.id !== id));
  };

  const handleApplyWonDiscount = () => {
    applyDiscount("NUTS20");
    setCopied(true);
    toast.success("Code NUTS20 applied! 20% OFF added to your cart!");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs grid place-items-center p-4">
      <div className="bg-background border border-border rounded-sm max-w-lg w-full p-6 shadow-2xl relative font-body space-y-6 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-accent text-xs font-mono font-semibold uppercase tracking-widest">
            <Trophy size={14} /> Interactive Play & Win
          </div>
          <h3 className="font-display text-2xl font-bold">Nut Ninja Challenge</h3>
          <p className="text-xs text-muted-foreground">
            Slice nuts on screen to win an instant <strong className="text-accent">20% OFF Discount Code</strong>!
          </p>
        </div>

        {/* Game Canvas Area */}
        <div className="h-64 bg-clay-light/80 border border-border rounded-sm relative overflow-hidden grid place-items-center select-none">
          {!isPlaying && !gameEnded && (
            <div className="text-center space-y-4">
              <span className="text-5xl animate-bounce inline-block">🥜</span>
              <p className="text-xs font-medium text-foreground">Click Start Game and slice nuts as fast as you can!</p>
              <button
                onClick={startGame}
                className="bg-accent text-accent-foreground px-6 py-2.5 rounded-sm font-display text-xs uppercase tracking-widest font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Start Game
              </button>
            </div>
          )}

          {isPlaying && (
            <>
              <div className="absolute top-3 left-4 text-xs font-mono font-bold text-accent">
                Time: {timeLeft}s
              </div>
              <div className="absolute top-3 right-4 text-xs font-mono font-bold text-emerald-600">
                Score: {score}
              </div>

              {nuts.map((nut) => (
                <button
                  key={nut.id}
                  onClick={() => sliceNut(nut.id)}
                  style={{ top: `${nut.top}%`, left: `${nut.left}%` }}
                  className="absolute text-4xl hover:scale-125 active:scale-75 transition-transform duration-150 cursor-pointer animate-in zoom-in-50"
                >
                  {nut.emoji}
                </button>
              ))}
            </>
          )}

          {gameEnded && (
            <div className="text-center space-y-4 p-4 animate-in fade-in">
              <span className="text-4xl">🎉</span>
              <h4 className="font-display text-xl font-bold">Challenge Complete!</h4>
              <p className="text-xs text-muted-foreground font-mono">You scored {score} points!</p>
              <div className="bg-accent/10 border border-accent/30 p-3 rounded-sm text-xs font-mono font-semibold text-accent">
                Unlocked Code: <strong>NUTS20</strong> (20% OFF)
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleApplyWonDiscount}
                  className="bg-accent text-accent-foreground px-5 py-2 rounded-sm text-xs font-semibold flex items-center gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Applied to Cart!" : "Apply to Cart"}
                </button>
                <button
                  onClick={startGame}
                  className="border border-border px-4 py-2 rounded-sm text-xs font-medium hover:bg-clay-light transition-colors flex items-center gap-1"
                >
                  <RotateCcw size={14} /> Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutNinjaGame;
