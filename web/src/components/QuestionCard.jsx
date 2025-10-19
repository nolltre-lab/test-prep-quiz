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
      padding:18,
      minHeight:120
    }}>
      {canShowHeader && (
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {typeof qIndex === "number" && typeof qTotal === "number" && (
              <span style={pillStyle}>Q <strong>{Math.max(0, qIndex + 1)}</strong> / {qTotal}</span>
            )}
          </div>
          {typeof timeLeft === "number" && (
            <span style={pillStyle}>⏳ {Math.max(0, timeLeft)}s</span>
          )}
        </div>
      )}

      <div style={{fontSize:18,lineHeight:1.35,marginBottom:12}}>{q.front}</div>

      <div style={{display:"grid",gap:10}}>
        {q.choices.map((c, idx) => {
          const isReveal = revealIndex !== null;
          const isCorrect = isReveal && idx === revealIndex;
          const isWrong = !isReveal && wrongIndex !== null && idx === wrongIndex;

          return (
            <button
              key={idx}
              onClick={() => onChoose && onChoose(idx)}
              disabled={disabled || isReveal}
              style={{
                textAlign:"left",
                background:"#22284a",
                border:"1px solid #2f3869",
                padding:"12px",
                borderRadius:10,
                cursor: (disabled || isReveal) ? "default" : "pointer",
                outline: isCorrect
                  ? "2px solid #6ee7b7"  // ✅ green on reveal
                  : isWrong
                  ? "2px solid #ff6b6b"  // 🔴 red on wrong guess
                  : "none",
                color:"#e8ebff"
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
  gap:6,
  padding:"4px 10px",
  borderRadius:999,
  border:"1px solid #2b3361",
  background:"#141a34",
  color:"#9aa6ff",
  fontSize:12
};