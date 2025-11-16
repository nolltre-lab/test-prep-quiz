import React, { useEffect } from "react";
import { soundPlayer } from "./SoundEffects.jsx";

/**
 * PlayerEndScreen - Simple, clean final results for players
 *
 * Props:
 *  - players: Array of {name, score, avatar}
 *  - onClose: Callback for closing the screen
 */
export default function PlayerEndScreen({ players = [], onClose }) {
  useEffect(() => {
    // Play celebration sound on mount
    soundPlayer.playCelebration();
  }, []);

  const sorted = [...players].sort((a, b) => {
    // Primary sort: by score (descending)
    if (b.score !== a.score) return b.score - a.score;
    // Secondary sort: by name (alphabetical ascending) for stable ordering
    return (a.name || '').localeCompare(b.name || '');
  });

  // Medal emojis for top 3
  const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 19, 32, 0.98)",
      backdropFilter: "blur(10px)",
      zIndex: 10000,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(16px, 3vh, 32px)",
      overflow: "auto",
      pointerEvents: "auto"
    }}>
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      {/* Confetti */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: "-10%",
              width: "clamp(8px, 1.5vw, 12px)",
              height: "clamp(8px, 1.5vw, 12px)",
              background: ["#FFD700", "#C0C0C0", "#CD7F32", "#6ee7b7", "#ff006e", "#00f5d4"][Math.floor(Math.random() * 6)],
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
              animation: `confetti-fall ${3 + Math.random() * 4}s linear ${Math.random() * 2}s infinite`,
              opacity: 0.8
            }}
          />
        ))}
      </div>

      <div style={{
        maxWidth: "clamp(100%, 90vw, 600px)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "clamp(16px, 3vh, 24px)"
      }}>
        {/* Title */}
        <div style={{ textAlign: "center", animation: "slide-up 0.6s ease-out" }}>
          <h1 style={{
            fontSize: "clamp(32px, 8vw, 56px)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #FFD700 0%, #6ee7b7 50%, #ff006e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: 0,
            marginBottom: "clamp(8px, 1vh, 12px)"
          }}>
            🎉 Game Over! 🎉
          </h1>
          <p style={{
            fontSize: "clamp(16px, 3vw, 20px)",
            color: "#9aa6ff",
            margin: 0
          }}>
            Final Results
          </p>
        </div>

        {/* Results List */}
        <div style={{
          width: "100%",
          background: "#12183a",
          border: "2px solid #2b3361",
          borderRadius: "clamp(12px, 2vw, 16px)",
          padding: "clamp(12px, 2vh, 20px)",
          maxHeight: "60vh",
          overflowY: "auto",
          animation: "slide-up 0.6s ease-out 0.2s backwards"
        }}>
          <div style={{ display: "grid", gap: "clamp(8px, 1.5vh, 12px)" }}>
            {sorted.map((player, idx) => {
              const medal = getMedal(idx);
              const isTopThree = idx < 3;

              return (
                <div
                  key={player.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: isTopThree
                      ? "linear-gradient(135deg, rgba(110, 231, 183, 0.15) 0%, rgba(36, 43, 74, 0.5) 100%)"
                      : "#1a1e3e",
                    border: isTopThree ? "2px solid #6ee7b7" : "1px solid #2b3361",
                    borderRadius: "clamp(10px, 1.5vw, 12px)",
                    padding: "clamp(10px, 2vh, 16px)",
                    transition: "all 0.3s ease",
                    animation: `slide-up 0.4s ease-out ${idx * 0.1}s backwards`
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 16px)", minWidth: 0 }}>
                    <span style={{
                      fontSize: "clamp(18px, 3vw, 24px)",
                      fontWeight: 700,
                      color: isTopThree ? "#6ee7b7" : "#9aa6ff",
                      minWidth: "clamp(32px, 5vw, 40px)",
                      textAlign: "center"
                    }}>
                      #{idx + 1}
                    </span>
                    {medal && (
                      <span style={{ fontSize: "clamp(24px, 4vw, 32px)" }}>
                        {medal}
                      </span>
                    )}
                    <span style={{ fontSize: "clamp(28px, 5vw, 40px)", flexShrink: 0 }}>
                      {player.avatar || "😀"}
                    </span>
                    <span style={{
                      fontSize: "clamp(16px, 2.8vw, 20px)",
                      fontWeight: isTopThree ? 700 : 500,
                      color: "#e8ebff",
                      wordBreak: "break-word",
                      minWidth: 0
                    }}>
                      {player.name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: "clamp(20px, 3.5vw, 28px)",
                    fontWeight: 800,
                    color: isTopThree ? "#6ee7b7" : "#9aa6ff",
                    flexShrink: 0,
                    marginLeft: "clamp(8px, 2vw, 16px)"
                  }}>
                    {player.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="touch-target"
            style={{
              background: "linear-gradient(135deg, #6ee7b7 0%, #00f5d4 100%)",
              border: "none",
              borderRadius: "clamp(12px, 2vw, 16px)",
              padding: "clamp(12px, 2vh, 16px) clamp(24px, 4vw, 40px)",
              fontSize: "clamp(16px, 2.5vw, 20px)",
              fontWeight: 700,
              color: "#0f1320",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(110, 231, 183, 0.4)",
              transition: "all 0.3s ease",
              animation: "slide-up 0.6s ease-out 0.4s backwards"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Join Another Game
          </button>
        )}
      </div>
    </div>
  );
}
