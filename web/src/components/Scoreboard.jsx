import React from "react";

export default function Scoreboard({ players }){
  const sorted = [...(players||[])].sort((a,b)=>b.score-a.score);
  return (
    <div style={{marginTop:"var(--spacing-md, 12px)",maxWidth:"100%",overflow:"hidden"}}>
      <h3 style={{color:"#9aa6ff",margin:"var(--spacing-sm, 8px) 0",fontSize:"var(--font-lg, 18px)"}}>Scoreboard</h3>
      <div style={{display:"grid",gap:"var(--spacing-sm, 8px)",width:"100%"}}>
        {sorted.map((p, idx)=>(
          <div key={p.name} className="scoreboard-item" style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            background: idx === 0 && sorted.length > 1 ? "linear-gradient(135deg, #2d1b4e 0%, #12183a 100%)" : "#12183a",
            border: idx === 0 && sorted.length > 1 ? "3px solid var(--accent, #6ee7b7)" : "2px solid #2b3361",
            borderRadius:10,
            transition:"all 0.3s"
          }}>
            <div style={{display:"flex",alignItems:"center",gap:"var(--spacing-md, 10px)",minWidth:0,flex:1}}>
              <span style={{fontSize:"clamp(24px, 4vw, 40px)",flexShrink:0}}>{p.avatar || "😀"}</span>
              <div style={{fontSize:"clamp(14px, 2vw, 18px)",wordWrap:"break-word",overflowWrap:"break-word",minWidth:0}}>
                {idx === 0 && sorted.length > 1 && <span style={{marginRight:"var(--spacing-xs, 6px)",fontSize:"clamp(16px, 2.5vw, 24px)"}}>👑</span>}
                {p.name}
              </div>
            </div>
            <strong style={{
              color: idx === 0 && sorted.length > 1 ? "var(--accent, #6ee7b7)" : "#6ee7b7",
              fontSize:"clamp(20px, 3vw, 32px)"
            }}>{p.score}</strong>
          </div>
        ))}
        {sorted.length===0 && <div style={{opacity:.7,fontSize:"var(--font-base, 16px)"}}>Waiting for players…</div>}
      </div>
    </div>
  );
}