import React, { useEffect } from "react";
import { soundPlayer } from "./SoundEffects.jsx";

/**
 * EndScreen component - Victory podium with gold/silver/bronze display
 * Rebuilt from scratch for Game Master
 */
export default function EndScreen({ players = [], onClose, showCloseButton = false }) {
  useEffect(() => {
    soundPlayer.playCelebration();
  }, []);

  console.log("EndScreen: Received players prop:", players);
  console.log("EndScreen: Is array?", Array.isArray(players));
  console.log("EndScreen: Players length:", players?.length);

  // Ensure players is an array and has valid data
  const validPlayers = Array.isArray(players)
    ? players.filter(p => p && p.name && typeof p.score === 'number')
    : [];

  console.log("EndScreen: Valid players after filtering:", validPlayers);

  // Sort by score descending, then alphabetically by name for stable ordering
  const sorted = [...validPlayers].sort((a, b) => {
    // Primary sort: by score (descending)
    if (b.score !== a.score) return b.score - a.score;
    // Secondary sort: by name (alphabetical ascending)
    return (a.name || '').localeCompare(b.name || '');
  });

  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const rest = sorted.slice(3);

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
      overflow: "auto"
    }}>
      <style>{`
        @keyframes podium-rise {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes confetti {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      {/* Confetti */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: -1 }}>
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: "-10vh",
              width: "10px",
              height: "10px",
              background: ["#FFD700", "#C0C0C0", "#CD7F32", "#6ee7b7", "#ff006e"][i % 5],
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
              animation: `confetti ${3 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`
            }}
          />
        ))}
      </div>

      <div style={{
        maxWidth: "1200px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "clamp(20px, 4vh, 40px)"
      }}>
        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontSize: "clamp(40px, 8vw, 72px)",
            fontWeight: 900,
            background: "linear-gradient(135deg, #FFD700 0%, #6ee7b7 50%, #ff006e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
            marginBottom: "16px"
          }}>
            🎉 Game Over! 🎉
          </h1>
          <p style={{
            fontSize: "clamp(18px, 3vw, 28px)",
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
            gap: "clamp(12px, 2vw, 24px)",
            width: "100%",
            maxWidth: "900px"
          }}>
            {/* Second Place */}
            {second && (
              <PodiumCard
                player={second}
                rank={2}
                height="140px"
                color="#C0C0C0"
                gradient="linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 100%)"
                delay="0.15s"
              />
            )}

            {/* First Place */}
            {first && (
              <PodiumCard
                player={first}
                rank={1}
                height="200px"
                color="#FFD700"
                gradient="linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
                delay="0s"
                pulse={true}
              />
            )}

            {/* Third Place */}
            {third && (
              <PodiumCard
                player={third}
                rank={3}
                height="100px"
                color="#CD7F32"
                gradient="linear-gradient(135deg, #E6A862 0%, #CD7F32 100%)"
                delay="0.3s"
              />
            )}
          </div>
        )}

        {/* Rest of players */}
        {rest.length > 0 && (
          <div style={{
            width: "100%",
            maxWidth: "700px",
            background: "#1a1e3e",
            borderRadius: "16px",
            padding: "20px",
            border: "2px solid #2b3361"
          }}>
            <h3 style={{
              color: "#9aa6ff",
              fontSize: "20px",
              marginTop: 0,
              marginBottom: "16px"
            }}>
              Other Players
            </h3>
            <div style={{ display: "grid", gap: "10px" }}>
              {rest.map((player, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#12172b",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #2b3361"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#6ee7b7",
                      minWidth: "32px"
                    }}>
                      #{idx + 4}
                    </span>
                    <span style={{ fontSize: "32px" }}>
                      {player.avatar || "😀"}
                    </span>
                    <span style={{
                      fontSize: "18px",
                      color: "#e8ebff",
                      fontWeight: 500
                    }}>
                      {player.name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#6ee7b7"
                  }}>
                    {player.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No players fallback */}
        {sorted.length === 0 && (
          <div style={{
            padding: "60px",
            background: "#1a1e3e",
            borderRadius: "16px",
            textAlign: "center",
            color: "#9aa6ff"
          }}>
            <p style={{ fontSize: "24px", margin: 0 }}>No players found</p>
          </div>
        )}

        {/* Close button */}
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            style={{
              background: "linear-gradient(135deg, #6ee7b7 0%, #00f5d4 100%)",
              border: "none",
              borderRadius: "16px",
              padding: "16px 48px",
              fontSize: "20px",
              fontWeight: 700,
              color: "#0f1320",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(110, 231, 183, 0.4)",
              transition: "transform 0.2s"
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

function PodiumCard({ player, rank, height, color, gradient, delay, pulse = false }) {
  const medals = {
    1: "🥇",
    2: "🥈",
    3: "🥉"
  };

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      animation: `podium-rise 0.8s ease-out ${delay} both`
    }}>
      {/* Player Card */}
      <div style={{
        background: gradient,
        borderRadius: "20px",
        padding: "clamp(16px, 3vh, 24px)",
        marginBottom: "12px",
        boxShadow: `0 8px 32px ${color}40`,
        border: "3px solid rgba(255, 255, 255, 0.3)",
        textAlign: "center",
        minWidth: "140px",
        maxWidth: "200px",
        animation: pulse ? "pulse 2s ease-in-out infinite" : "none"
      }}>
        <div style={{ fontSize: "clamp(50px, 10vw, 80px)", marginBottom: "8px" }}>
          {player.avatar || "😀"}
        </div>
        <div style={{
          fontSize: "clamp(18px, 3vw, 24px)",
          fontWeight: 700,
          color: "#0f1320",
          marginBottom: "8px",
          wordBreak: "break-word"
        }}>
          {player.name}
        </div>
        <div style={{
          fontSize: "clamp(32px, 6vw, 56px)",
          fontWeight: 900,
          color: "#0f1320"
        }}>
          {player.score}
        </div>
        <div style={{ fontSize: "clamp(28px, 5vw, 48px)", marginTop: "8px" }}>
          {medals[rank]}
        </div>
      </div>

      {/* Podium Base */}
      <div style={{
        width: "100%",
        height: height,
        background: gradient,
        borderRadius: "12px 12px 0 0",
        border: "3px solid rgba(255, 255, 255, 0.3)",
        borderBottom: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "clamp(48px, 8vw, 80px)",
        fontWeight: 900,
        color: "#0f1320",
        boxShadow: `0 8px 32px ${color}40`
      }}>
        {rank}
      </div>
    </div>
  );
}
