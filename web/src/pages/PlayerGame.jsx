import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { socket } from "../socket";
import QuestionCard from "../components/QuestionCard.jsx";
import Scoreboard from "../components/Scoreboard.jsx";
import { ThemeOverlay } from "../components/ThemeOverlay.jsx";
import { ConfettiBurst, useConfetti } from "../components/ConfettiBurst.jsx";
import { soundPlayer, SoundMuteToggle } from "../components/SoundEffects.jsx";
import { WinnerCelebration } from "../components/WinnerCelebration.jsx";

function applyThemeToDocument(theme) {
  try {
    const root = document.documentElement;
    const vars = theme?.vars || {};
    Object.keys(vars).forEach(k => root.style.setProperty(k, vars[k]));
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

export default function PlayerGame(){
  const { code, name } = useParams();
  const [searchParams] = useSearchParams();
  const avatar = searchParams.get('avatar') || '😀';
  const nav = useNavigate();

  const [room,setRoom] = useState(null);
  const [q,setQ] = useState(null);
  const [reveal,setReveal] = useState(null);
  const [locked,setLocked] = useState(false);
  const [theme,setTheme] = useState(null);
  const [showWinnerCelebration, setShowWinnerCelebration] = useState(false);
  const [myAnswer, setMyAnswer] = useState(null); // Track player's answer choice
  const { confettiTrigger, fireConfetti } = useConfetti();

  const [now, setNow] = useState(Date.now());
  useEffect(()=>{
    const id = setInterval(()=> setNow(Date.now()), 250);
    return ()=> clearInterval(id);
  },[]);
  const timeLeft = room?.status === "question"
    ? Math.max(0, Math.round((room.endsAt - now)/1000))
    : 0;

  useEffect(()=>{
    socket.emit("player:join", { code, name, avatar }, (res)=>{
      if(!res?.ok){ alert("Could not join (bad code?)"); nav("/play"); }
    });

    const onUpdate = (r)=> {
      setRoom(r);
      if (r?.theme) {
        setTheme(r.theme);
        applyThemeToDocument(r.theme);
      }
    };
    const onNew = (payload)=>{ setQ(payload.q); setLocked(false); setReveal(null); setShowWinnerCelebration(false); setMyAnswer(null); };
    const onReveal = (payload)=>{
      setReveal(payload);
      setLocked(true);
      if (payload.winner === name) {
        fireConfetti();
        soundPlayer.playCelebration();
        setShowWinnerCelebration(true);
      }
    };
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
    setMyAnswer(idx); // Track what the player chose
    socket.emit("player:answer", { code, choiceIndex: idx }, (res)=>{
      if(!res?.ok){ /* ignore */ }
    });
  };

  const qNum = typeof room?.ix === "number" && room.ix >= 0 ? room.ix + 1 : 0;

  // Show wrong answer in red if player answered incorrectly (before reveal)
  const wrongIndex = !reveal && myAnswer !== null ? myAnswer : null;

  return (
    <div className="player-game-container" style={{position:"relative", zIndex:1, maxWidth:"100%"}}>
      {theme && <ThemeOverlay effects={theme.effects} />}
      <ConfettiBurst trigger={confettiTrigger} />
      <WinnerCelebration show={showWinnerCelebration} winnerName={name} />

      <div className="player-header" style={{marginBottom:10,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",opacity:.9}}>
          <span>Room <strong>{code}</strong></span>
          {room?.packTitle && <span>• {room.packTitle}</span>}
          {room && <span>• Q {qNum} / {room.total}</span>}
          {room?.status==="question" && <span>• ⏳ {timeLeft}s</span>}
        </div>
        <SoundMuteToggle />
      </div>

      <div className="player-question-section">
        {q ? (
          <>
            <QuestionCard
              q={q}
              onChoose={answer}
              disabled={locked}
              revealIndex={reveal?.correctIndex}
              wrongIndex={wrongIndex}
              timeLeft={room?.status === "question" ? timeLeft : undefined}
              qIndex={room?.ix}
              qTotal={room?.total}
            />
            <div style={{marginTop:8,opacity:.8}}>
              {room?.status==="question"
                ? <>Time left: <strong>{timeLeft}s</strong></>
                : reveal?.winner
                  ? <>Winner: <strong style={{color:"var(--good,#6ee7b7)"}}>{reveal.winner}</strong></>
                  : <>No correct answer.</>}
            </div>
          </>
        ) : (
          <div>Waiting for the Game Master to start…</div>
        )}
      </div>

      <div className="player-scoreboard-section">
        <Scoreboard players={room?.players}/>
      </div>
    </div>
  );
}