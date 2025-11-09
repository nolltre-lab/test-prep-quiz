import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

const AVATARS = ["😀", "🤩", "😎", "🥳", "🤓", "🦸", "🦄", "🐱", "🐶", "🐼", "🦊", "🐯", "🦁", "🐸", "🐵", "🦉"];

export default function PlayerJoin(){
  const [mode, setMode] = useState("browse"); // "browse" or "code"
  const [publicRooms, setPublicRooms] = useState([]);
  const [code,setCode] = useState("");
  const [name,setName] = useState("");
  const [avatar,setAvatar] = useState(AVATARS[0]);
  const nav = useNavigate();

  useEffect(() => {
    const onRoomsList = ({ rooms }) => {
      setPublicRooms(rooms || []);
    };
    socket.on("rooms:list", onRoomsList);
    return () => {
      socket.off("rooms:list", onRoomsList);
    };
  }, []);
  const joinRoom = (roomCode) => {
    const nameParam = encodeURIComponent(name || "Player");
    const avatarParam = encodeURIComponent(avatar);
    nav(`/play/${encodeURIComponent(roomCode)}/${nameParam}?avatar=${avatarParam}`);
  };

  return (
    <div style={{maxWidth:"100%",width:"100%",height:"100%",display:"flex",flexDirection:"column",overflow:"auto"}}>
      <h2 style={{margin:"clamp(4px, 0.5vh, 6px) 0",fontSize:"var(--font-xl, 24px)",flexShrink:0}}>Join a game</h2>

      {/* Player info (always shown) */}
      <div style={{display:"grid",gap:"var(--spacing-md, 10px)",maxWidth:"min(100%, 600px)",marginBottom:"var(--spacing-lg, 16px)"}}>
        <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}
               className="touch-target"
               style={{background:"#2b335c",color:"#e8ebff",border:"1px solid #3a4478",padding:"var(--spacing-md, 12px)",borderRadius:12,fontSize:"var(--font-base, 16px)"}}/>

        <div>
          <label style={{display:"block",marginBottom:"var(--spacing-sm, 8px)",fontSize:"var(--font-sm, 14px)",opacity:0.9}}>Choose your avatar:</label>
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit, minmax(60px, 1fr))",
            gap:"var(--spacing-sm, 8px)",
            padding:"4px"
          }}>
            {AVATARS.map(av => (
              <button
                key={av}
                onClick={() => setAvatar(av)}
                className="touch-target"
                style={{
                  fontSize:"var(--font-2xl, 32px)",
                  padding:"var(--spacing-sm, 8px)",
                  borderRadius:10,
                  border: avatar === av ? "3px solid var(--accent, #6ee7b7)" : "2px solid #3a4478",
                  background: avatar === av ? "var(--panel, #2b335c)" : "#1a1e3e",
                  cursor:"pointer",
                  transition:"all 0.2s",
                  transform: avatar === av ? "scale(1.1)" : "scale(1)",
                  minHeight:"60px"
                }}
              >
                {av}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{display:"flex",gap:"var(--spacing-sm, 8px)",marginBottom:"var(--spacing-md, 12px)",maxWidth:"min(100%, 600px)"}}>
        <button
          onClick={() => setMode("browse")}
          className="touch-target"
          style={{
            flex: 1,
            background: mode === "browse" ? "var(--accent, #6ee7b7)" : "#2b335c",
            color: mode === "browse" ? "#0f1320" : "#e8ebff",
            border: "none",
            borderRadius: 10,
            padding: "var(--spacing-md, 12px)",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "var(--font-base, 16px)"
          }}
        >
          Browse public rooms
        </button>
        <button
          onClick={() => setMode("code")}
          className="touch-target"
          style={{
            flex: 1,
            background: mode === "code" ? "var(--accent, #6ee7b7)" : "#2b335c",
            color: mode === "code" ? "#0f1320" : "#e8ebff",
            border: "none",
            borderRadius: 10,
            padding: "var(--spacing-md, 12px)",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "var(--font-base, 16px)"
          }}
        >
          Enter code
        </button>
      </div>

      {/* Browse mode: public rooms list */}
      {mode === "browse" && (
        <div style={{maxWidth:"min(100%, 600px)"}}>
          <h3 style={{fontSize:"var(--font-lg, 18px)",marginBottom:"var(--spacing-md, 12px)"}}>Available public rooms</h3>
          {publicRooms.length === 0 ? (
            <div style={{background:"#2b335c",border:"1px solid #3a4478",borderRadius:12,padding:"var(--spacing-lg, 16px)",textAlign:"center",opacity:0.7}}>
              No public rooms available. Create one or ask for a room code!
            </div>
          ) : (
            <div style={{display:"grid",gap:"var(--spacing-md, 10px)"}}>
              {publicRooms.map(room => (
                <button
                  key={room.code}
                  onClick={() => joinRoom(room.code)}
                  className="touch-target"
                  style={{
                    background:"#2b335c",
                    border:"2px solid #3a4478",
                    borderRadius:12,
                    padding:"var(--spacing-md, 12px)",
                    cursor:"pointer",
                    textAlign:"left",
                    transition:"all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent, #6ee7b7)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "#3a4478"}
                >
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"var(--spacing-xs, 4px)"}}>
                    <strong style={{fontSize:"var(--font-lg, 18px)",color:"var(--accent, #6ee7b7)"}}>{room.code}</strong>
                    <span style={{fontSize:"var(--font-sm, 14px)",opacity:0.7}}>{room.playerCount} player{room.playerCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{fontSize:"var(--font-sm, 14px)",opacity:0.8}}>{room.packTitle}</div>
                  {room.theme && room.theme !== "classic" && (
                    <div style={{fontSize:"var(--font-xs, 12px)",opacity:0.6,marginTop:"var(--spacing-xs, 4px)"}}>Theme: {room.theme}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Code mode: manual entry */}
      {mode === "code" && (
        <div style={{display:"grid",gap:"var(--spacing-md, 10px)",maxWidth:"min(100%, 600px)"}}>
          <input placeholder="Room code (e.g. 7H6GQ2)" value={code} onChange={e=>setCode(e.target.value.toUpperCase())}
                 className="touch-target"
                 style={{background:"#2b335c",color:"#e8ebff",border:"1px solid #3a4478",padding:"var(--spacing-md, 12px)",borderRadius:12,fontSize:"var(--font-base, 16px)"}}/>
          <button onClick={() => joinRoom(code)}
                  className="touch-target"
                  style={{background:"#6ee7b7",border:"none",borderRadius:12,padding:"var(--spacing-lg, 16px)",fontWeight:700,cursor:"pointer",fontSize:"var(--font-lg, 18px)"}}>
            Join
          </button>
        </div>
      )}
    </div>
  );
}