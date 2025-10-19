import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket";
import QuestionCard from "../components/QuestionCard.jsx";
import Scoreboard from "../components/Scoreboard.jsx";

export default function PlayerGame(){
  const { code, name } = useParams();
  const nav = useNavigate();

  const [room,setRoom] = useState(null);
  const [q,setQ] = useState(null);
  const [reveal,setReveal] = useState(null);
  const [locked,setLocked] = useState(false);
  const [wrongIndex, setWrongIndex] = useState(null); // 🔴 track wrong choice

  // ticking UI clock
  const [now, setNow] = useState(Date.now());
  useEffect(()=>{
    const id = setInterval(()=> setNow(Date.now()), 250);
    return ()=> clearInterval(id);
  },[]);
  const timeLeft = room?.status === "question"
    ? Math.max(0, Math.round((room.endsAt - now)/1000))
    : 0;

  useEffect(()=>{
    socket.emit("player:join", { code, name }, (res)=>{
      if(!res?.ok){ alert("Could not join (bad code?)"); nav("/play"); }
    });

    const onUpdate = (r)=> setRoom(r);
    const onNew = (payload)=>{ setQ(payload.q); setLocked(false); setReveal(null); setWrongIndex(null); };
    const onReveal = (payload)=>{ setReveal(payload); setLocked(true); };
    const onEnd = ()=>{ alert("Game finished!"); nav("/play"); };

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
  }, [code, name, nav]);

  const answer = (idx)=>{
    if(locked) return;
    setLocked(true);
    setWrongIndex(null); // clear before we know
    socket.emit("player:answer", { code, choiceIndex: idx }, (res)=>{
      if(!res?.ok){ return; }
      if(res.correct === false){         // 🔴 show immediate red outline
        setWrongIndex(idx);
      }
      // if correct, server will soon emit question:reveal which paints green
    });
  };

  const qNum = typeof room?.ix === "number" && room.ix >= 0 ? room.ix + 1 : 0;

  return (
    <div>
      <div style={{marginBottom:10,display:"flex",gap:10,flexWrap:"wrap",opacity:.9}}>
        <span>Room <strong>{code}</strong></span>
        {room?.packTitle && <span>• {room.packTitle}</span>}
        {room && <span>• Q {qNum} / {room.total}</span>}
        {room?.status==="question" && <span>• ⏳ {timeLeft}s</span>}
      </div>

      {q ? (
        <>
          <QuestionCard
            q={q}
            onChoose={answer}
            disabled={locked}
            revealIndex={reveal?.correctIndex}
            wrongIndex={wrongIndex}                // 🔴 pass wrong choice
            timeLeft={room?.status === "question" ? timeLeft : undefined}
            qIndex={room?.ix}
            qTotal={room?.total}
          />
          <div style={{marginTop:8,opacity:.8}}>
            {room?.status==="question"
              ? <>Time left: <strong>{timeLeft}s</strong></>
              : reveal?.winner
                ? <>Winner: <strong style={{color:"#6ee7b7"}}>{reveal.winner}</strong></>
                : <>No correct answer.</>}
          </div>
        </>
      ) : (
        <div>Waiting for the Game Master to start…</div>
      )}

      <Scoreboard players={room?.players}/>
    </div>
  );
}