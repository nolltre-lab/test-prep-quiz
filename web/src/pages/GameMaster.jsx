import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import { listPacks } from "../api";
import Scoreboard from "../components/Scoreboard.jsx";
import QuestionCard from "../components/QuestionCard.jsx";

export default function GameMaster(){
  const [packs,setPacks] = useState([]);
  const [packFile,setPackFile] = useState("");
  const [durationSec,setDurationSec] = useState(30);
  const [totalQuestions,setTotalQuestions] = useState(10);

  const [room,setRoom] = useState(null);
  const [q,setQ] = useState(null);
  const [reveal,setReveal] = useState(null);

  // local mirror for index/total from question:new (works even if server room:update lacks them)
  const [qIx, setQIx] = useState(-1);
  const [qTotal, setQTotal] = useState(0);

  // lightweight ticking clock so the UI timer counts down smoothly
  const [now, setNow] = useState(Date.now());
  useEffect(()=>{ const id=setInterval(()=>setNow(Date.now()), 250); return ()=>clearInterval(id); },[]);
  const timeLeft = room?.status === "question"
    ? Math.max(0, Math.round((room.endsAt - now)/1000))
    : 0;

  useEffect(()=>{ listPacks().then(setPacks); },[]);

  const selected = packs.find(p=>p.file===packFile);
  const maxQ = selected?.count || 1;

  useEffect(()=>{
    const onUpdate = (r)=> {
      setRoom(r);
      // If server includes ix/total here, keep our mirrors in sync too
      if (typeof r?.ix === "number") setQIx(r.ix);
      if (typeof r?.total === "number") setQTotal(r.total);
    };
    const onNew = (payload)=>{
      setQ(payload.q);
      setReveal(null);
      if (typeof payload.ix === "number") setQIx(payload.ix);
      if (typeof payload.total === "number") setQTotal(payload.total);
    };
    const onReveal = (payload)=> setReveal(payload);
    const onEnd = ()=>{ setQ(null); setReveal(null); setQIx(-1); setQTotal(0); alert("Game finished!"); };

    socket.on("room:update", onUpdate);
    socket.on("question:new", onNew);
    socket.on("question:reveal", onReveal);
    socket.on("game:ended", onEnd);
    return ()=>{
      socket.off("room:update", onUpdate);
      socket.off("question:new", onNew);
      socket.off("question:reveal", onReveal);
      socket.off("game:ended", onEnd);
    };
  },[]);

  const createRoom = ()=>{
    if(!packFile) return alert("Choose a pack");
    // clamp before sending
    const wanted = Math.max(1, Math.min(maxQ, Number(totalQuestions||maxQ)));
    socket.emit("gm:create", { packFile, durationSec, totalQuestions: wanted }, (res)=>{
      if(!res?.ok) return alert("Create failed");
      // room state will sync via room:update
    });
  };
  const start = ()=> socket.emit("gm:start", { code: room?.code }, ()=>{});
  const next  = ()=> socket.emit("gm:next",  { code: room?.code }, ()=>{});

  const currentNumber = qIx >= 0 ? qIx + 1 : 0;

  return (
    <div>
      <h2 style={{margin:"6px 0"}}>Game Master</h2>

      {!room && (
        <div style={{display:"grid",gap:10,gridTemplateColumns:"1fr 130px 150px 140px",alignItems:"end",maxWidth:880}}>
          <div>
            <label style={{display:"block",marginBottom:6,opacity:.8}}>Pack</label>
            <select value={packFile} onChange={e=>setPackFile(e.target.value)}
                    style={{width:"100%",background:"#2b335c",color:"#e8ebff",border:"1px solid #3a4478",padding:"10px 12px",borderRadius:12}}>
              <option value="">— Select pack —</option>
              {packs.map(p => <option key={p.file} value={p.file}>{p.title} ({p.count})</option>)}
            </select>
            {selected && <div style={{fontSize:12,opacity:.6,marginTop:6}}>Available questions: {selected.count}</div>}
          </div>

          <div>
            <label style={{display:"block",marginBottom:6,opacity:.8}}>Seconds / question</label>
            <input type="number" min={5} max={120} value={durationSec}
                   onChange={e=>setDurationSec(Number(e.target.value))}
                   style={{width:"100%",background:"#2b335c",color:"#e8ebff",border:"1px solid #3a4478",padding:"10px 12px",borderRadius:12}}/>
          </div>

          <div>
            <label style={{display:"block",marginBottom:6,opacity:.8}}>Number of questions</label>
            <input type="number" min={1} max={maxQ} value={totalQuestions}
                   onChange={e=>setTotalQuestions(Math.max(1, Math.min(maxQ, Number(e.target.value))))}
                   style={{width:"100%",background:"#2b335c",color:"#e8ebff",border:"1px solid #3a4478",padding:"10px 12px",borderRadius:12}}/>
          </div>

          <button onClick={createRoom}
                  style={{background:"#6ee7b7",border:"none",borderRadius:12,padding:"12px 14px",fontWeight:700,cursor:"pointer"}}>
            Create room
          </button>
        </div>
      )}

      {room && (
        <>
          <div style={{marginTop:12,display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
            <Pill>Room: <strong>{room.code}</strong></Pill>
            <Pill>Pack: {room.packTitle}</Pill>
            <Pill>Players: {room.players?.length || 0}</Pill>
            <Pill>Q {currentNumber} / {qTotal || room.total || 0}</Pill>
            {room.status === "question" && <Pill>⏳ {timeLeft}s</Pill>}
          </div>

          <div style={{marginTop:12,display:"flex",gap:10,flexWrap:"wrap"}}>
            {room.status === "lobby" && <button onClick={start} className="btn">Start game</button>}
            {(room.status === "reveal" || room.status === "question") && <button onClick={next} className="btn">Next</button>}
            <style>{`.btn{background:#6ee7b7;border:none;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer}`}</style>
          </div>

          {q && (
            <div style={{marginTop:12}}>
              <QuestionCard
                q={q}
                disabled
                revealIndex={reveal?.correctIndex}
                // optional props if your QuestionCard supports showing them
                timeLeft={room.status === "question" ? timeLeft : undefined}
                qIndex={qIx}
                qTotal={qTotal || room.total}
              />
            </div>
          )}

          <Scoreboard players={room.players}/>
        </>
      )}
    </div>
  );
}

function Pill({children}) {
  return (
    <span style={{
      background:"#12172b",
      border:"1px solid #242b4a",
      padding:"6px 10px",
      borderRadius:10
    }}>
      {children}
    </span>
  );
}