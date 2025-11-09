import React, { useEffect, useState } from "react";

// Helper to detect mobile and reduce particle count
const isMobile = () => window.innerWidth < 768;

export function ConfettiBurst({ trigger, onComplete }) {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    if (trigger > 0) {
      const particleCount = isMobile() ? 12 : 30; // Reduce particles on mobile
      const newBurst = {
        id: Date.now(),
        particles: Array.from({ length: particleCount }, (_, i) => ({
          id: i,
          emoji: ['🎉', '🎊', '✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 6)],
          x: Math.random() * 100 - 50,
          y: Math.random() * 100 - 50,
          rotation: Math.random() * 720,
          delay: Math.random() * 0.1,
          duration: 1 + Math.random() * 0.5
        }))
      };

      setBursts(prev => [...prev, newBurst]);

      setTimeout(() => {
        setBursts(prev => prev.filter(b => b.id !== newBurst.id));
        if (onComplete) onComplete();
      }, 2000);
    }
  }, [trigger, onComplete]);

  return (
    <>
      <style>{`
        @keyframes confetti-burst {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--x), var(--y)) rotate(var(--rotation)) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
      {bursts.map(burst => (
        <div key={burst.id} style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          pointerEvents: "none",
          zIndex: 9999
        }}>
          {burst.particles.map(p => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                fontSize: isMobile() ? "18px" : "24px",
                animation: `confetti-burst ${p.duration}s ease-out ${p.delay}s forwards`,
                "--x": `${p.x}vw`,
                "--y": `${p.y}vh`,
                "--rotation": `${p.rotation}deg`
              }}
            >
              {p.emoji}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

// Hook for easy confetti triggering
export function useConfetti() {
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const fireConfetti = () => {
    setConfettiTrigger(prev => prev + 1);
  };

  return { confettiTrigger, fireConfetti };
}
