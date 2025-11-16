import React from "react";

/**
 * BonusNotification - Shows point breakdown with bonuses and multipliers
 *
 * Props:
 *  - show: boolean - whether to display the notification
 *  - speedBonus: number - speed bonus points earned
 *  - streakMultiplier: number - streak multiplier (1x, 2x, 3x)
 *  - lightningMultiplier: number - lightning round multiplier (1x or 2x)
 *  - pointsEarned: number - total points earned
 *  - isWinner: boolean - whether this player was first (winner)
 */
export default function BonusNotification({
  show,
  speedBonus = 0,
  streakMultiplier = 1,
  lightningMultiplier = 1,
  pointsEarned = 10,
  isWinner = true
}) {
  if (!show) return null;

  const hasBonus = speedBonus > 0 || streakMultiplier > 1 || lightningMultiplier > 1;

  return (
    <div style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 9999,
      background: "linear-gradient(135deg, #6ee7b7 0%, #00f5d4 100%)",
      border: "4px solid #6ee7b7",
      borderRadius: "clamp(16px, 3vw, 24px)",
      padding: "clamp(20px, 4vh, 40px)",
      boxShadow: "0 8px 32px rgba(110, 231, 183, 0.6)",
      animation: "bonus-pop 0.6s ease-out",
      minWidth: "clamp(200px, 40vw, 400px)",
      textAlign: "center"
    }}>
      <style>{`
        @keyframes bonus-pop {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>

      <div style={{
        fontSize: "clamp(48px, 10vw, 80px)",
        fontWeight: 900,
        color: "#0f1320",
        marginBottom: "clamp(8px, 2vh, 16px)"
      }}>
        +{pointsEarned}
      </div>

      {hasBonus && (
        <div style={{
          background: "rgba(15, 19, 32, 0.15)",
          borderRadius: "clamp(8px, 1.5vw, 12px)",
          padding: "clamp(8px, 1.5vh, 16px)",
          marginTop: "clamp(8px, 1.5vh, 12px)"
        }}>
          <div style={{
            fontSize: "clamp(14px, 2.5vw, 18px)",
            color: "#0f1320",
            fontWeight: 600,
            marginBottom: "clamp(4px, 0.8vh, 8px)"
          }}>
            Point Breakdown:
          </div>
          <div style={{
            display: "grid",
            gap: "clamp(4px, 0.8vh, 8px)",
            fontSize: "clamp(12px, 2vw, 16px)",
            color: "#0f1320"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Base Score:</span>
              <strong>10 pts</strong>
            </div>
            {streakMultiplier > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{streakMultiplier >= 5 ? "🔥" : "⚡"} Streak {streakMultiplier}x:</span>
                <strong>{10 * streakMultiplier} pts</strong>
              </div>
            )}
            {speedBonus > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>⚡ Speed Bonus:</span>
                <strong>+{speedBonus} pts</strong>
              </div>
            )}
            {lightningMultiplier > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>⚡ Lightning Round 2x:</span>
                <strong>×{lightningMultiplier}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{
        marginTop: "clamp(12px, 2vh, 20px)",
        fontSize: "clamp(18px, 3vw, 28px)",
        fontWeight: 700,
        color: "#0f1320"
      }}>
        {isWinner ? "🎉 Correct! You won! 🎉" : "✅ Correct! ✅"}
      </div>

      {!isWinner && (
        <div style={{
          marginTop: "clamp(8px, 1.5vh, 12px)",
          fontSize: "clamp(12px, 2vw, 16px)",
          color: "#0f1320",
          opacity: 0.8
        }}>
          Someone else answered first
        </div>
      )}
    </div>
  );
}
