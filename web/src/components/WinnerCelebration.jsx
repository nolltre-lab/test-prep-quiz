import React, { useEffect, useState } from "react";

export function WinnerCelebration({ show, winnerName, onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes celebration-slide-in {
          0% {
            transform: translateY(-200%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translateY(0) scale(1.2);
            opacity: 1;
          }
          70% {
            transform: translateY(0) scale(0.95);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes celebration-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes celebration-fade-out {
          0% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
      <div
        className="winner-celebration"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10000,
          textAlign: "center",
          animation: "celebration-slide-in 0.8s ease-out, celebration-pulse 1s ease-in-out 0.8s 2, celebration-fade-out 3s ease-in-out",
          maxWidth: "90vw",
          width: "auto"
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, var(--accent, #6ee7b7) 0%, var(--good, #4ade80) 100%)",
            padding: "clamp(15px, 5vw, 30px) clamp(20px, 8vw, 50px)",
            borderRadius: "clamp(12px, 3vw, 20px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px var(--accent, #6ee7b7)",
            border: "clamp(2px, 0.5vw, 4px) solid var(--ink, #ffffff)"
          }}
        >
          <div style={{ fontSize: "clamp(30px, 10vw, 60px)", marginBottom: "clamp(5px, 2vw, 10px)" }}>
            🎉 🏆 🎉
          </div>
          <div
            style={{
              fontSize: "clamp(18px, 5vw, 32px)",
              fontWeight: "700",
              color: "#ffffff",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              marginBottom: "clamp(3px, 1vw, 5px)",
              wordBreak: "break-word"
            }}
          >
            {winnerName} WINS!
          </div>
          <div
            style={{
              fontSize: "clamp(24px, 8vw, 48px)",
              letterSpacing: "clamp(2px, 1vw, 4px)"
            }}
          >
            ⭐ 🌟 ⭐
          </div>
        </div>
      </div>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          zIndex: 9999,
          animation: "celebration-fade-out 3s ease-in-out"
        }}
      />
    </>
  );
}
