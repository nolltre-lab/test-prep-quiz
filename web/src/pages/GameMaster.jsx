import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import { listPacks } from "../api";
import Scoreboard from "../components/Scoreboard.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import { ThemeOverlay } from "../components/ThemeOverlay.jsx";

/* simple helper to apply CSS variables + body bg */
function applyThemeToDocument(theme) {
  try {
    const root = document.documentElement;
    const vars = theme?.vars || {};
    Object.keys(vars).forEach(k => root.style.setProperty(k, vars[k]));
    // optional background image/color for body
    if (vars["--bg-image"]) {
      document.body.style.backgroundImage = `url(${vars["--bg-image"]})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    } else {
      document.body.style.backgroundImage = "";
    }
    if (vars["--bg-color"]) {
      document.body.style.backgroundColor = vars["--bg-color"];
    }
    if (vars["--font-family"]) {
      document.body.style.fontFamily = vars["--font-family"];
    } else {
      document.body.style.fontFamily = "Poppins, system-ui";
    }
  } catch {}
}

export default function GameMaster(){
  const [packs,setPacks] = useState([]);
  const [packFile,setPackFile] = useState("");
  const [durationSec,setDurationSec] = useState(30);
  const [totalQuestions,setTotalQuestions] = useState(10);

  const [themes,setThemes] = useState([]);
  const [themeName,setThemeName] = useState("classic");

  const [room,setRoom] = useState(null);
  const [q,setQ] = useState(null);
  const [reveal,setReveal] = useState(null);
  const [theme,setTheme] = useState(null);

  useEffect(()=>{ listPacks().then(setPacks); },[]);

  useEffect(()=>{
    // fetch available themes
    fetch("/api/themes").then(r=>r.json()).then(d=> setThemes(d.themes || []));
  },[]);

  useEffect(()=>{
    const onUpdate = (r)=> {
      setRoom(r);
      if (r?.theme) {
        setTheme(r.theme);
        applyThemeToDocument(r.theme);
      }
    };
    const onNew = (payload)=>{ setQ(payload.q); setReveal(null); };
    const onReveal = (payload)=> setReveal(payload);
    const onEnd = ()=>{ setQ(null); setReveal(null); alert("Game finished!"); };
    const onAuto = ()=> {
      // GM can choose to go next automatically or manually;
      // here we auto-press next for convenience
      if (room?.code) socket.emit("gm:next", { code: room.code }, ()=>{});
    };

    socket.on("room:update", onUpdate);
    socket.on("question:new", onNew);
    socket.on("question:reveal", onReveal);
    socket.on("game:ended", onEnd);
    socket.on("gm:auto-next", onAuto);
    return ()=>{
      socket.off("room:update", onUpdate);
      socket.off("question:new", onNew);
      socket.off("question:reveal", onReveal);
      socket.off("game:ended", onEnd);
      socket.off("gm:auto-next", onAuto);
    };
  },[room?.code]);

  const createRoom = ()=>{
    if(!packFile) return alert("Choose a pack");
    socket.emit("gm:create", { packFile, durationSec, totalQuestions, themeName }, (res)=>{
      if(!res?.ok) return alert("Create failed");
      // state will sync via room:update
    });
  };
  const start = ()=> socket.emit("gm:start", { code: room?.code }, ()=>{});
  const next = ()=> socket.emit("gm:next", { code: room?.code }, ()=>{});

  // bound by selected pack
  const selected = packs.find(p=>p.file===packFile);
  const maxQ = selected?.count || 1;

  return (
    <div style={{position:"relative", zIndex:1, maxWidth:"100%", overflow:"hidden"}}>
      {theme && <ThemeOverlay effects={theme.effects} />}

      <h2 style={{margin:"6px 0"}}>Game Master</h2>

      {!room && (
        <div style={{
          display:"grid",
          gap:"var(--spacing-md, 10px)",
          gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          maxWidth:"100%",
          width:"100%"
        }}>
          <div style={{gridColumn:"1 / -1"}}>
            <label style={{display:"block",marginBottom:"var(--spacing-xs, 6px)",opacity:.8,fontSize:"var(--font-sm, 14px)"}}>Pack</label>
            <select value={packFile} onChange={e=>setPackFile(e.target.value)}
                    className="touch-target"
                    style={{width:"100%",background:"#2b335c",color:"var(--ink, #e8ebff)",border:"1px solid #3a4478",padding:"var(--spacing-md, 12px)",borderRadius:12,fontSize:"var(--font-base, 16px)"}}>
              <option value="">— Select pack —</option>
              {packs.map(p => <option key={p.file} value={p.file}>{p.title} ({p.count})</option>)}
            </select>
            {selected && <div style={{fontSize:"var(--font-xs, 12px)",opacity:.6,marginTop:"var(--spacing-xs, 6px)"}}>Available questions: {selected.count}</div>}
          </div>

          <div>
            <label style={{display:"block",marginBottom:"var(--spacing-xs, 6px)",opacity:.8,fontSize:"var(--font-sm, 14px)"}}>Seconds / question</label>
            <input type="number" min={5} max={120} value={durationSec}
                   onChange={e=>setDurationSec(Number(e.target.value))}
                   className="touch-target"
                   style={{width:"100%",background:"#2b335c",color:"var(--ink, #e8ebff)",border:"1px solid #3a4478",padding:"var(--spacing-md, 12px)",borderRadius:12,fontSize:"var(--font-base, 16px)"}}/></div>

          <div>
            <label style={{display:"block",marginBottom:"var(--spacing-xs, 6px)",opacity:.8,fontSize:"var(--font-sm, 14px)"}}>Number of questions</label>
            <input type="number" min={1} max={maxQ} value={totalQuestions}
                   onChange={e=>setTotalQuestions(Math.max(1, Math.min(maxQ, Number(e.target.value))))}
                   className="touch-target"
                   style={{width:"100%",background:"#2b335c",color:"var(--ink, #e8ebff)",border:"1px solid #3a4478",padding:"var(--spacing-md, 12px)",borderRadius:12,fontSize:"var(--font-base, 16px)"}}/>
          </div>

          <div style={{gridColumn:"1 / -1"}}>
            <label style={{display:"block",marginBottom:"var(--spacing-xs, 6px)",opacity:.8,fontSize:"var(--font-sm, 14px)"}}>Theme</label>
            <select value={themeName} onChange={e=>setThemeName(e.target.value)}
                    className="touch-target"
                    style={{width:"100%",background:"#2b335c",color:"var(--ink, #e8ebff)",border:"1px solid #3a4478",padding:"var(--spacing-md, 12px)",borderRadius:12,fontSize:"var(--font-base, 16px)"}}>
              {themes.map(t => <option key={t.file} value={t.name}>{t.name}</option>)}
            </select>
            <div style={{fontSize:"var(--font-xs, 12px)",opacity:.6,marginTop:"var(--spacing-xs, 6px)"}}>Applies to GM & all players in this room</div>
          </div>

          <button onClick={createRoom}
                  className="touch-target"
                  style={{
                    gridColumn:"1 / -1",
                    background:"var(--accent, #6ee7b7)",
                    border:"none",
                    borderRadius:12,
                    padding:"var(--spacing-lg, 16px)",
                    fontWeight:700,
                    cursor:"pointer",
                    fontSize:"var(--font-lg, 18px)"
                  }}>
            Create room
          </button>
        </div>
      )}

      {room && (
        <div className="gm-game-view">
          <div className="gm-header" style={{display:"flex",gap:"var(--spacing-md, 12px)",flexWrap:"wrap",alignItems:"center"}}>
            <span style={{background:"var(--panel,#12172b)",border:"1px solid #242b4a",padding:"var(--spacing-sm, 8px) var(--spacing-md, 12px)",borderRadius:10,fontSize:"var(--font-sm, 14px)"}}>Room: <strong style={{fontSize:"var(--font-lg, 18px)"}}>{room.code}</strong></span>
            <span style={{background:"var(--panel,#12172b)",border:"1px solid #242b4a",padding:"var(--spacing-sm, 8px) var(--spacing-md, 12px)",borderRadius:10,fontSize:"var(--font-sm, 14px)"}}>Pack: {room.packTitle}</span>
            <span style={{background:"var(--panel,#12172b)",border:"1px solid #242b4a",padding:"var(--spacing-sm, 8px) var(--spacing-md, 12px)",borderRadius:10,fontSize:"var(--font-sm, 14px)"}}>Players: {room.players?.length || 0}</span>
            <span style={{background:"var(--panel,#12172b)",border:"1px solid #242b4a",padding:"var(--spacing-sm, 8px) var(--spacing-md, 12px)",borderRadius:10,fontSize:"var(--font-sm, 14px)"}}>Total Q: {room.total}</span>
            {room.theme?.name && <span style={{background:"var(--panel,#12172b)",border:"1px solid #242b4a",padding:"var(--spacing-sm, 8px) var(--spacing-md, 12px)",borderRadius:10,fontSize:"var(--font-sm, 14px)"}}>Theme: {room.theme.name}</span>}
          </div>

          <div className="gm-controls" style={{display:"flex",gap:"var(--spacing-md, 10px)",flexWrap:"wrap"}}>
            {room.status === "lobby" && <button onClick={start} className="btn touch-target">Start game</button>}
            {(room.status === "reveal" || room.status === "question") && <button onClick={next} className="btn touch-target">Next</button>}
            <style>{`.btn{background:var(--accent, #6ee7b7);border:none;border-radius:12px;padding:var(--spacing-md, 12px) var(--spacing-lg, 16px);font-weight:700;cursor:pointer;fontSize:var(--font-base, 16px)}`}</style>
          </div>

          <div className="gm-question-area">
            {q && (
              <div>
                <QuestionCard q={q} disabled revealIndex={reveal?.correctIndex}/>
                <div style={{marginTop:8,opacity:.8}}>
                  {room.status==="question"
                    ? <>Time left: <strong>{Math.max(0, Math.round((room.endsAt - Date.now())/1000))}s</strong></>
                    : reveal?.winner
                      ? <>Winner: <strong style={{color:"var(--good,#6ee7b7)"}}>{reveal.winner}</strong></>
                      : <>No correct answer.</>}
                </div>
              </div>
            )}
          </div>

          <div className="gm-scoreboard-area">
            <Scoreboard players={room.players}/>
          </div>
        </div>
      )}
    </div>
  );
}