import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { socket } from "../socket";
import QuestionCard from "../components/QuestionCard.jsx";
import Scoreboard from "../components/Scoreboard.jsx";
import { ThemeOverlay } from "../components/ThemeOverlay.jsx";
import { ConfettiBurst, useConfetti } from "../components/ConfettiBurst.jsx";
import { soundPlayer, SoundMuteToggle } from "../components/SoundEffects.jsx";
import PlayerEndScreen from "../components/PlayerEndScreen.jsx";
import BonusNotification from "../components/BonusNotification.jsx";
import StreakBrokenNotification from "../components/StreakBrokenNotification.jsx";

// Hook to keep screen awake during active questions
function useWakeLock(isActive) {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isActive) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        // Wake lock request failed - not critical, just ignore
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err) {
          // Release failed - not critical
        }
      }
    };

    if (isActive) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Re-acquire wake lock when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isActive]);
}

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
  const [myAnswer, setMyAnswer] = useState(null); // Track player's answer choice
  const [gameEnded,setGameEnded] = useState(false);
  const { confettiTrigger, fireConfetti } = useConfetti();
  const [bonusInfo, setBonusInfo] = useState(null); // Track bonus points information
  const [showBonus, setShowBonus] = useState(false);
  const [showStreakBroken, setShowStreakBroken] = useState(false);
  const [brokenStreakValue, setBrokenStreakValue] = useState(0);
  const previousStreakRef = useRef(0); // Track previous streak to detect breaks

  const [now, setNow] = useState(Date.now());
  useEffect(()=>{
    const id = setInterval(()=> setNow(Date.now()), 250);
    return ()=> clearInterval(id);
  },[]);
  const timeLeft = room?.status === "question"
    ? Math.max(0, Math.round((room.endsAt - now)/1000))
    : 0;

  // Keep screen awake during active questions
  const isQuestionActive = q !== null && (room?.status === "question" || room?.status === "reveal");
  useWakeLock(isQuestionActive);

  // Detect when streak is broken
  useEffect(() => {
    if (!room?.players || !name) return;

    // Find current player's streak
    const currentPlayer = room.players.find(p => p.name === name);
    const currentStreak = currentPlayer?.streak || 0;
    const previousStreak = previousStreakRef.current;

    // Streak was broken if it dropped from 3+ to 0
    if (previousStreak >= 3 && currentStreak === 0) {
      setBrokenStreakValue(previousStreak);
      setShowStreakBroken(true);
      // Hide after 2.5 seconds
      setTimeout(() => setShowStreakBroken(false), 2500);
    }

    // Update the ref for next comparison
    previousStreakRef.current = currentStreak;
  }, [room?.players, name]);

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
    const onNew = (payload)=>{ setQ(payload.q); setLocked(false); setReveal(null); setMyAnswer(null); setShowBonus(false); setBonusInfo(null); };
    const onReveal = (payload)=>{
      setReveal(payload);
      setLocked(true);
      if (payload.winner === name) {
        fireConfetti();
        soundPlayer.playCelebration();
      }
    };
    const onEnd = ()=>{ setGameEnded(true); };

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
      if(res?.ok && res?.correct) {
        // Show bonus notification if player got it right
        setBonusInfo({
          speedBonus: res.speedBonus || 0,
          streakMultiplier: res.streakMultiplier || 1,
          lightningMultiplier: res.lightningMultiplier || 1,
          pointsEarned: res.pointsEarned || 10
        });
        setShowBonus(true);
        // Hide bonus notification after 3 seconds
        setTimeout(() => setShowBonus(false), 3000);
      }
    });
  };

  const qNum = typeof room?.ix === "number" && room.ix >= 0 ? room.ix + 1 : 0;

  // Show wrong answer in red if player answered incorrectly (before reveal)
  const wrongIndex = !reveal && myAnswer !== null ? myAnswer : null;

  return (
    <>
      {/* End Screen - Simple list-based results for players */}
      {gameEnded && room && (
        <PlayerEndScreen
          players={room.players || []}
          onClose={() => nav("/play")}
        />
      )}

      <div className="player-game-container" style={{position:"relative", zIndex:1, maxWidth:"100%"}}>
        {theme && <ThemeOverlay effects={theme.effects} />}
        <ConfettiBurst trigger={confettiTrigger} />
        <BonusNotification
          show={showBonus}
          speedBonus={bonusInfo?.speedBonus}
          streakMultiplier={bonusInfo?.streakMultiplier}
          lightningMultiplier={bonusInfo?.lightningMultiplier}
          pointsEarned={bonusInfo?.pointsEarned}
        />
        <StreakBrokenNotification
          show={showStreakBroken}
          previousStreak={brokenStreakValue}
        />

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
              isLightning={room?.isLightning || false}
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
    </>
  );
}