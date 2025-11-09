import React from "react";

/**
 * Props:
 *  - q: { front, choices[] }
 *  - onChoose?: (idx)=>void
 *  - disabled?: boolean
 *  - revealIndex?: number|null   // correct answer (green) when revealed
 *  - wrongIndex?: number|null    // player's wrong guess (red) before reveal
 *  - timeLeft?: number           // OPTIONAL: seconds remaining (live)
 *  - qIndex?: number             // OPTIONAL: 0-based current question index
 *  - qTotal?: number             // OPTIONAL: total questions in game
 */
export default function QuestionCard({
  q,
  onChoose,
  disabled = false,
  revealIndex = null,
  wrongIndex = null,
  timeLeft,
  qIndex,
  qTotal,
}) {
  if (!q) return null;

  const canShowHeader = (typeof timeLeft === "number") || (typeof qIndex === "number" && typeof qTotal === "number");

  return (
    <div style={{
      background:"#0f1320",
      border:"1px solid #242b4a",
      borderRadius:14,
      padding:"clamp(10px, 1.5vh, 20px)",
      minHeight:0,
      maxWidth:"100%",
      overflow:"visible" /* Allow outlines to show */
    }}>
      {canShowHeader && (
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"var(--spacing-sm, 8px)",flexWrap:"wrap",gap:"var(--spacing-sm, 8px)"}}>
          <div style={{display:"flex",gap:"var(--spacing-sm, 8px)",flexWrap:"wrap"}}>
            {typeof qIndex === "number" && typeof qTotal === "number" && (
              <span style={pillStyle}>Q <strong>{Math.max(0, qIndex + 1)}</strong> / {qTotal}</span>
            )}
          </div>
          {typeof timeLeft === "number" && (
            <span style={pillStyle}>⏳ {Math.max(0, timeLeft)}s</span>
          )}
        </div>
      )}

      <div className="question-text" style={{marginBottom:"var(--spacing-md, 12px)",wordWrap:"break-word",overflowWrap:"break-word"}}>{q.front}</div>

      <div style={{display:"grid",gap:"var(--spacing-md, 10px)",width:"100%"}}>
        {q.choices.map((c, idx) => {
          const isReveal = revealIndex !== null;
          const isCorrect = isReveal && idx === revealIndex;
          const isWrong = !isReveal && wrongIndex !== null && idx === wrongIndex;

          return (
            <button
              key={idx}
              onClick={() => onChoose && onChoose(idx)}
              disabled={disabled || isReveal}
              className="answer-button touch-target"
              style={{
                textAlign:"left",
                background:"#22284a",
                border:"1px solid #2f3869",
                borderRadius:10,
                cursor: (disabled || isReveal) ? "default" : "pointer",
                outline: isCorrect
                  ? "3px solid #6ee7b7"  // ✅ green on reveal (thicker for visibility on TV)
                  : isWrong
                  ? "3px solid #ff6b6b"  // 🔴 red on wrong guess
                  : "none",
                color:"#e8ebff",
                transition:"all 0.2s ease",
                wordWrap:"break-word",
                overflowWrap:"break-word",
                whiteSpace:"normal"
              }}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const pillStyle = {
  display:"inline-flex",
  alignItems:"center",
  gap:"var(--spacing-xs, 6px)",
  padding:"var(--spacing-xs, 4px) var(--spacing-sm, 10px)",
  borderRadius:999,
  border:"1px solid #2b3361",
  background:"#141a34",
  color:"#9aa6ff",
  fontSize:"var(--font-xs, 12px)"
};