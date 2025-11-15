import React from "react";

/**
 * StreakBrokenNotification - Shows when a player's streak is broken
 *
 * Props:
 *  - show: boolean - whether to display the notification
 *  - previousStreak: number - the streak that was lost
 */
export default function StreakBrokenNotification({ show, previousStreak = 0 }) {
  if (!show || previousStreak < 3) return null; // Only show if they had a significant streak (3+)

  return (
    <div style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 9998,
      background: "linear-gradient(135deg, #FF6B6B 0%, #FF006E 100%)",
      border: "4px solid #FF6B6B",
      borderRadius: "clamp(16px, 3vw, 24px)",
      padding: "clamp(20px, 4vh, 40px)",
      boxShadow: "0 8px 32px rgba(255, 107, 107, 0.6)",
      animation: "streak-break 0.8s ease-out",
      minWidth: "clamp(200px, 40vw, 400px)",
      textAlign: "center"
    }}>
      <style>{`
        @keyframes streak-break {
          0% { transform: translate(-50%, -50%) scale(1.2) rotate(0deg); opacity: 0; }
          20% { transform: translate(-50%, -50%) scale(0.9) rotate(-5deg); opacity: 1; }
          40% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
          60% { transform: translate(-50%, -50%) scale(0.95) rotate(-3deg); }
          80% { transform: translate(-50%, -50%) scale(1.05) rotate(2deg); }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes crack-line {
          0% { width: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>

      <div style={{
        fontSize: "clamp(48px, 10vw, 72px)",
        marginBottom: "clamp(8px, 2vh, 16px)"
      }}>
        💔
      </div>

      <div style={{
        fontSize: "clamp(24px, 5vw, 36px)",
        fontWeight: 900,
        color: "#FFFFFF",
        marginBottom: "clamp(8px, 2vh, 12px)",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)"
      }}>
        STREAK BROKEN!
      </div>

      <div style={{
        background: "rgba(255, 255, 255, 0.2)",
        borderRadius: "clamp(8px, 1.5vw, 12px)",
        padding: "clamp(8px, 1.5vh, 12px)",
        marginTop: "clamp(8px, 1.5vh, 12px)"
      }}>
        <div style={{
          fontSize: "clamp(14px, 2.5vw, 18px)",
          color: "#FFFFFF",
          fontWeight: 600
        }}>
          Lost {previousStreak}× {previousStreak >= 5 ? "🔥" : "⚡"} streak
        </div>
        <div style={{
          fontSize: "clamp(12px, 2vw, 14px)",
          color: "rgba(255, 255, 255, 0.9)",
          marginTop: "clamp(4px, 0.8vh, 6px)"
        }}>
          Another player answered first!
        </div>
      </div>

      {/* Crack effect */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        height: "2px",
        background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)",
        animation: "crack-line 0.6s ease-out",
        pointerEvents: "none"
      }} />
    </div>
  );
}
