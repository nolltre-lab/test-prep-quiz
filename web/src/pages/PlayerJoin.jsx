import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AVATARS = ["😀", "🤩", "😎", "🥳", "🤓", "🦸", "🦄", "🐱", "🐶", "🐼", "🦊", "🐯", "🦁", "🐸", "🐵", "🦉"];

export default function PlayerJoin(){
  const [code,setCode] = useState("");
  const [name,setName] = useState("");
  const [avatar,setAvatar] = useState(AVATARS[0]);
  const nav = useNavigate();
  return (
    <div style={{maxWidth:"100%",width:"100%",height:"100%",display:"flex",flexDirection:"column",overflow:"auto"}}>
      <h2 style={{margin:"clamp(4px, 0.5vh, 6px) 0",fontSize:"var(--font-xl, 24px)",flexShrink:0}}>Join a game</h2>
      <div style={{display:"grid",gap:"var(--spacing-md, 10px)",maxWidth:"min(100%, 600px)"}}>
        <input placeholder="Room code (e.g. 7H6GQ2)" value={code} onChange={e=>setCode(e.target.value.toUpperCase())}
               className="touch-target"
               style={{background:"#2b335c",color:"#e8ebff",border:"1px solid #3a4478",padding:"var(--spacing-md, 12px)",borderRadius:12,fontSize:"var(--font-base, 16px)"}}/>
        <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}
               className="touch-target"
               style={{background:"#2b335c",color:"#e8ebff",border:"1px solid #3a4478",padding:"var(--spacing-md, 12px)",borderRadius:12,fontSize:"var(--font-base, 16px)"}}/>

        <div>
          <label style={{display:"block",marginBottom:"var(--spacing-sm, 8px)",fontSize:"var(--font-sm, 14px)",opacity:0.9}}>Choose your avatar:</label>
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit, minmax(60px, 1fr))",
            gap:"var(--spacing-sm, 8px)",
            padding:"4px" /* Prevent border/scale cutoff */
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

        <button onClick={()=>{
          const nameParam = encodeURIComponent(name||"Player");
          const avatarParam = encodeURIComponent(avatar);
          nav(`/play/${encodeURIComponent(code)}/${nameParam}?avatar=${avatarParam}`);
        }}
                className="touch-target"
                style={{background:"#6ee7b7",border:"none",borderRadius:12,padding:"var(--spacing-lg, 16px)",fontWeight:700,cursor:"pointer",fontSize:"var(--font-lg, 18px)"}}>
          Join
        </button>
      </div>
    </div>
  );
}