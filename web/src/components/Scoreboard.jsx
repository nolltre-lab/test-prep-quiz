import React from "react";

export default function Scoreboard({ players }){
  const sorted = [...(players||[])].sort((a,b)=> {
    // Primary sort: by score (descending)
    if (b.score !== a.score) return b.score - a.score;
    // Secondary sort: by name (alphabetical ascending) for stable ordering
    return (a.name || '').localeCompare(b.name || '');
  });
  return (
    <div style={{maxWidth:"100%",overflow:"hidden"}}>
      <h3 style={{color:"#9aa6ff",margin:"clamp(2px, 0.5vh, 6px) 0",fontSize:"clamp(14px, 2.2vw, 18px)"}}>Scoreboard</h3>
      <div style={{display:"grid",gap:"clamp(4px, 0.5vh, 8px)",width:"100%"}}>
        {sorted.map((p, idx)=>(
          <div key={p.playerId || p.name} className="scoreboard-item" style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            background: idx === 0 && sorted.length > 1 ? "linear-gradient(135deg, #2d1b4e 0%, #12183a 100%)" : "#12183a",
            border: idx === 0 && sorted.length > 1 ? "3px solid var(--accent, #6ee7b7)" : "2px solid #2b3361",
            borderRadius:10,
            transition:"all 0.3s"
          }}>
            <div style={{display:"flex",alignItems:"center",gap:"clamp(4px, 1vw, 10px)",minWidth:0,flex:1}}>
              <span style={{fontSize:"clamp(18px, 3.5vw, 40px)",flexShrink:0}}>{p.avatar || "😀"}</span>
              <div style={{fontSize:"clamp(12px, 2vw, 18px)",wordWrap:"break-word",overflowWrap:"break-word",minWidth:0}}>
                {idx === 0 && sorted.length > 1 && <span style={{marginRight:"clamp(2px, 0.5vw, 6px)",fontSize:"clamp(14px, 2.2vw, 24px)"}}>👑</span>}
                {p.name}
                {p.streak >= 3 && (
                  <span style={{
                    marginLeft:"clamp(4px, 0.8vw, 8px)",
                    fontSize:"clamp(10px, 1.8vw, 14px)",
                    padding:"clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px)",
                    background: p.streak >= 5 ? "linear-gradient(135deg, #FF6B00 0%, #FFD700 100%)" : "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    borderRadius:999,
                    color:"#0f1320",
                    fontWeight:700,
                    display:"inline-flex",
                    alignItems:"center",
                    gap:"clamp(2px, 0.4vw, 4px)"
                  }}>
                    {p.streak >= 5 ? "🔥" : "⚡"} {p.streak}× streak
                  </span>
                )}
              </div>
            </div>
            <strong style={{
              color: idx === 0 && sorted.length > 1 ? "var(--accent, #6ee7b7)" : "#6ee7b7",
              fontSize:"clamp(16px, 2.8vw, 32px)",
              flexShrink:0
            }}>{p.score}</strong>
          </div>
        ))}
        {sorted.length===0 && <div style={{opacity:.7,fontSize:"var(--font-base, 16px)"}}>Waiting for players…</div>}
      </div>
    </div>
  );
}