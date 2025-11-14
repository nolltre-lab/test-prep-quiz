import React, { useEffect } from "react";
import { soundPlayer } from "./SoundEffects.jsx";

/**
 * EndScreen component - Victory podium with gold/silver/bronze display
 *
 * Props:
 *  - players: Array of {name, score, avatar}
 *  - onClose: Optional callback for closing the screen
 *  - showCloseButton: Whether to show a close/new game button
 */
export default function EndScreen({ players = [], onClose, showCloseButton = false }) {
  useEffect(() => {
    // Play celebration sound on mount
    soundPlayer.playCelebration();
  }, []);

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const [first, second, third, ...rest] = sorted;

  // Medal colors
  const medals = {
    1: { emoji: "🥇", color: "#FFD700", bg: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)", shadow: "0 8px 32px rgba(255, 215, 0, 0.4)" },
    2: { emoji: "🥈", color: "#C0C0C0", bg: "linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 100%)", shadow: "0 6px 24px rgba(192, 192, 192, 0.4)" },
    3: { emoji: "🥉", color: "#CD7F32", bg: "linear-gradient(135deg, #E6A862 0%, #CD7F32 100%)", shadow: "0 4px 16px rgba(205, 127, 50, 0.4)" },
  };

  const PodiumPlayer = ({ player, rank, height }) => {
    if (!player) return <div style={{ flex: 1 }} />;

    const medal = medals[rank];
    return (
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        animation: `podium-rise 0.8s ease-out ${rank * 0.15}s forwards`,
        opacity: 0,
        transform: "translateY(100%)"
      }}>
        {/* Player info */}
        <div style={{
          background: medal.bg,
          borderRadius: "clamp(12px, 2vw, 20px)",
          padding: "clamp(12px, 2vh, 20px)",
          marginBottom: "clamp(8px, 1vh, 12px)",
          boxShadow: medal.shadow,
          border: "3px solid rgba(255, 255, 255, 0.3)",
          textAlign: "center",
          minWidth: "clamp(100px, 20vw, 180px)",
          maxWidth: "clamp(140px, 25vw, 220px)",
          animation: rank === 1 ? "pulse 2s ease-in-out infinite" : "none"
        }}>
          <div style={{ fontSize: "clamp(40px, 8vw, 80px)", marginBottom: "clamp(4px, 0.5vh, 8px)" }}>
            {player.avatar || "😀"}
          </div>
          <div style={{
            fontSize: "clamp(16px, 2.5vw, 24px)",
            fontWeight: 700,
            color: "#0f1320",
            marginBottom: "clamp(4px, 0.5vh, 8px)",
            wordBreak: "break-word"
          }}>
            {player.name}
          </div>
          <div style={{
            fontSize: "clamp(24px, 4vw, 48px)",
            fontWeight: 800,
            color: "#0f1320"
          }}>
            {player.score}
          </div>
          <div style={{ fontSize: "clamp(20px, 3vw, 40px)", marginTop: "clamp(4px, 0.5vh, 8px)" }}>
            {medal.emoji}
          </div>
        </div>

        {/* Podium step */}
        <div style={{
          width: "100%",
          height: height,
          minHeight: "60px",
          background: medal.bg,
          borderRadius: "clamp(8px, 1.5vw, 12px) clamp(8px, 1.5vw, 12px) 0 0",
          border: "3px solid rgba(255, 255, 255, 0.3)",
          borderBottom: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "clamp(32px, 5vw, 64px)",
          fontWeight: 800,
          color: "#0f1320",
          boxShadow: medal.shadow
        }}>
          {rank}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 19, 32, 0.95)",
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
        @keyframes podium-rise {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      {/* Confetti */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {Array.from({ length: 50 }, (_, i) => (
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
        maxWidth: "clamp(100%, 90vw, 1200px)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "clamp(16px, 3vh, 32px)"
      }}>
        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontSize: "clamp(32px, 6vw, 64px)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #FFD700 0%, #6ee7b7 50%, #ff006e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: 0,
            marginBottom: "clamp(8px, 1vh, 16px)"
          }}>
            🎉 Game Over! 🎉
          </h1>
          <p style={{
            fontSize: "clamp(16px, 2.5vw, 24px)",
            color: "#9aa6ff",
            margin: 0
          }}>
            Final Results
          </p>
        </div>

        {/* Podium - Top 3 */}
        {sorted.length > 0 && (
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: "clamp(8px, 2vw, 16px)",
            width: "100%",
            maxWidth: "800px",
            marginBottom: "clamp(16px, 3vh, 32px)"
          }}>
            {/* 2nd place */}
            <PodiumPlayer player={second} rank={2} height="clamp(80px, 15vh, 140px)" />
            {/* 1st place */}
            <PodiumPlayer player={first} rank={1} height="clamp(120px, 22vh, 200px)" />
            {/* 3rd place */}
            <PodiumPlayer player={third} rank={3} height="clamp(60px, 12vh, 100px)" />
          </div>
        )}

        {/* Remaining players */}
        {rest.length > 0 && (
          <div style={{
            width: "100%",
            maxWidth: "600px",
            background: "#12183a",
            border: "2px solid #2b3361",
            borderRadius: "clamp(12px, 2vw, 16px)",
            padding: "clamp(12px, 2vh, 20px)",
            maxHeight: "30vh",
            overflowY: "auto"
          }}>
            <h3 style={{
              fontSize: "clamp(16px, 2.5vw, 20px)",
              color: "#9aa6ff",
              marginTop: 0,
              marginBottom: "clamp(8px, 1.5vh, 16px)"
            }}>
              Other Players
            </h3>
            <div style={{ display: "grid", gap: "clamp(6px, 1vh, 10px)" }}>
              {rest.map((player, idx) => (
                <div
                  key={player.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#1a1e3e",
                    border: "1px solid #2b3361",
                    borderRadius: "clamp(8px, 1.5vw, 10px)",
                    padding: "clamp(8px, 1.5vh, 12px)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 1.5vw, 12px)" }}>
                    <span style={{
                      fontSize: "clamp(14px, 2vw, 18px)",
                      fontWeight: 600,
                      color: "#6ee7b7",
                      minWidth: "clamp(24px, 4vw, 32px)"
                    }}>
                      #{idx + 4}
                    </span>
                    <span style={{ fontSize: "clamp(24px, 4vw, 32px)" }}>
                      {player.avatar || "😀"}
                    </span>
                    <span style={{
                      fontSize: "clamp(14px, 2vw, 18px)",
                      fontWeight: 500,
                      color: "#e8ebff"
                    }}>
                      {player.name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: "clamp(18px, 3vw, 24px)",
                    fontWeight: 700,
                    color: "#6ee7b7"
                  }}>
                    {player.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close/New Game button */}
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="touch-target"
            style={{
              background: "linear-gradient(135deg, #6ee7b7 0%, #00f5d4 100%)",
              border: "none",
              borderRadius: "clamp(12px, 2vw, 16px)",
              padding: "clamp(12px, 2vh, 20px) clamp(24px, 4vw, 48px)",
              fontSize: "clamp(16px, 2.5vw, 24px)",
              fontWeight: 700,
              color: "#0f1320",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(110, 231, 183, 0.4)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            New Game
          </button>
        )}
      </div>
    </div>
  );
}
