import React from "react";

// Helper to detect mobile and reduce animation counts for performance
const isMobile = () => window.innerWidth < 768;
const getCount = (desktopCount, mobileReduction = 0.5) => {
  return isMobile() ? Math.max(1, Math.round(desktopCount * mobileReduction)) : desktopCount;
};

export function ThemeOverlay({ effects }) {
  if (!effects) return null;

  // Disable theme overlays on mobile to reduce visual clutter and improve performance
  if (isMobile()) {
    return null;
  }

  // HALLOWEEN THEME - Go absolutely nuts! 🎃👻🦇
  if (effects.halloween) {
    return <HalloweenOverlay />;
  }

  // Legacy effects for other themes (we'll enhance these next)
  if (effects.bats) {
    const bats = Array.from({length: getCount(10)}, (_,i)=> i);
    return (
      <div style={{position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0}}>
        <style>{`
          @keyframes bat-fly {
            from { transform: translateY(0) translateX(0); }
            to { transform: translateY(-50px) translateX(50px); }
          }
        `}</style>
        {bats.map(i=>(
          <div key={i} style={{
            position:"absolute",
            top: `${Math.random()*80}%`,
            left: `${Math.random()*90}%`,
            fontSize: 24 + Math.round(Math.random()*10),
            opacity: 0.6,
            animation: `bat-fly ${8 + Math.random()*6}s ease-in-out ${Math.random()*3}s infinite alternate`
          }}>🦇</div>
        ))}
      </div>
    );
  }

  if (effects.snow) {
    const flakes = Array.from({length:getCount(40, 0.4)}, (_,i)=>i);
    return (
      <div style={{position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0}}>
        <style>{`
          @keyframes snow-fall {
            from { transform: translateY(-10px) translateX(0); }
            to { transform: translateY(100vh) translateX(50px); }
          }
        `}</style>
        {flakes.map(i=>(
          <div key={i} style={{
            position:"absolute",
            top:"-10px",
            left: `${Math.random()*100}%`,
            fontSize: 12 + Math.round(Math.random()*16),
            opacity: 0.7,
            animation: `snow-fall ${8 + Math.random()*8}s linear ${Math.random()*5}s infinite`
          }}>❄️</div>
        ))}
      </div>
    );
  }

  if (effects.balloons) {
    const balloons = Array.from({length: getCount(15)}, (_,i)=> i);
    const colors = ['🎈','🎈','🎈','🟣','🔵','🟢','🟡','🔴','🟠'];
    return (
      <div style={{position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0}}>
        <style>{`
          @keyframes balloon-float {
            0% { transform: translateY(120vh) translateX(0) rotate(0deg); }
            50% { transform: translateY(50vh) translateX(30px) rotate(10deg); }
            100% { transform: translateY(-20vh) translateX(-20px) rotate(-5deg); }
          }
        `}</style>
        {balloons.map(i=>(
          <div key={i} style={{
            position:"absolute",
            bottom: "-10vh",
            left: `${Math.random()*90}%`,
            fontSize: 30 + Math.round(Math.random()*20),
            opacity: 0.8,
            animation: `balloon-float ${12 + Math.random()*8}s ease-in-out ${Math.random()*5}s infinite`
          }}>{colors[i % colors.length]}</div>
        ))}
      </div>
    );
  }

  if (effects.confetti) {
    const confetti = Array.from({length: getCount(30, 0.4)}, (_,i)=> i);
    const pieces = ['🎊','🎉','✨','⭐','💫'];
    return (
      <div style={{position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0}}>
        <style>{`
          @keyframes confetti-fall {
            0% { transform: translateY(-10px) rotate(0deg); }
            100% { transform: translateY(110vh) rotate(720deg); }
          }
        `}</style>
        {confetti.map(i=>(
          <div key={i} style={{
            position:"absolute",
            top: "-20px",
            left: `${Math.random()*100}%`,
            fontSize: 16 + Math.round(Math.random()*12),
            opacity: 0.7,
            animation: `confetti-fall ${5 + Math.random()*4}s linear ${Math.random()*3}s infinite`
          }}>{pieces[i % pieces.length]}</div>
        ))}
      </div>
    );
  }

  if (effects.sparkles) {
    const sparkles = Array.from({length: getCount(25, 0.4)}, (_,i)=> i);
    return (
      <div style={{position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0}}>
        <style>{`
          @keyframes sparkle-twinkle {
            0%, 100% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
        {sparkles.map(i=>(
          <div key={i} style={{
            position:"absolute",
            top: `${Math.random()*100}%`,
            left: `${Math.random()*100}%`,
            fontSize: 16 + Math.round(Math.random()*12),
            animation: `sparkle-twinkle ${2 + Math.random()*3}s ease-in-out ${Math.random()*2}s infinite`
          }}>✨</div>
        ))}
      </div>
    );
  }

  if (effects.rainbows) {
    const rainbows = Array.from({length: getCount(8)}, (_,i)=> i);
    return (
      <div style={{position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0}}>
        <style>{`
          @keyframes rainbow-slide {
            0% { transform: translateX(-100%) rotate(-20deg); }
            100% { transform: translateX(120vw) rotate(-20deg); }
          }
        `}</style>
        {rainbows.map(i=>(
          <div key={i} style={{
            position:"absolute",
            top: `${20 + Math.random()*60}%`,
            left: "-20%",
            fontSize: 60 + Math.round(Math.random()*30),
            opacity: 0.3,
            animation: `rainbow-slide ${15 + Math.random()*10}s linear ${Math.random()*5}s infinite`
          }}>🌈</div>
        ))}
      </div>
    );
  }

  if (effects.stars) {
    const stars = Array.from({length: getCount(50, 0.3)}, (_,i)=> i);
    return (
      <div style={{position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0}}>
        <style>{`
          @keyframes star-twinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
        {stars.map(i=>(
          <div key={i} style={{
            position:"absolute",
            top: `${Math.random()*100}%`,
            left: `${Math.random()*100}%`,
            fontSize: 12 + Math.round(Math.random()*16),
            animation: `star-twinkle ${1 + Math.random()*3}s ease-in-out ${Math.random()*2}s infinite`
          }}>⭐</div>
        ))}
      </div>
    );
  }

  if (effects.planets) {
    const planets = ['🪐','🌍','🌕','🌙','☄️'];
    return (
      <div style={{position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0}}>
        <style>{`
          @keyframes planet-drift {
            0% { transform: translateX(-20vw) translateY(0); }
            50% { transform: translateX(50vw) translateY(-30px); }
            100% { transform: translateX(120vw) translateY(0); }
          }
        `}</style>
        {planets.map((planet, i)=>(
          <div key={i} style={{
            position:"absolute",
            top: `${10 + i * 18}%`,
            left: "-15vw",
            fontSize: 40 + Math.round(Math.random()*30),
            opacity: 0.6,
            animation: `planet-drift ${20 + Math.random()*15}s linear ${i * 4}s infinite`
          }}>{planet}</div>
        ))}
      </div>
    );
  }

  if (effects.fish) {
    const fish = Array.from({length: getCount(12)}, (_,i)=> i);
    const fishEmojis = ['🐠','🐟','🐡','🦈','🐙','🦑'];
    return (
      <div style={{position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0}}>
        <style>{`
          @keyframes fish-swim {
            0% { transform: translateX(-20vw) translateY(0); }
            100% { transform: translateX(120vw) translateY(20px); }
          }
        `}</style>
        {fish.map(i=>(
          <div key={i} style={{
            position:"absolute",
            top: `${10 + Math.random()*80}%`,
            left: "-15vw",
            fontSize: 30 + Math.round(Math.random()*20),
            opacity: 0.7,
            animation: `fish-swim ${10 + Math.random()*8}s linear ${Math.random()*5}s infinite`
          }}>{fishEmojis[i % fishEmojis.length]}</div>
        ))}
      </div>
    );
  }

  if (effects.bubbles) {
    const bubbles = Array.from({length: getCount(30, 0.4)}, (_,i)=> i);
    return (
      <div style={{position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0}}>
        <style>{`
          @keyframes bubble-rise {
            0% { transform: translateY(110vh) translateX(0); opacity: 0.7; }
            100% { transform: translateY(-10vh) translateX(30px); opacity: 0; }
          }
        `}</style>
        {bubbles.map(i=>(
          <div key={i} style={{
            position:"absolute",
            bottom: "-10vh",
            left: `${Math.random()*100}%`,
            fontSize: 20 + Math.round(Math.random()*15),
            animation: `bubble-rise ${8 + Math.random()*6}s ease-in ${Math.random()*4}s infinite`
          }}>💧</div>
        ))}
      </div>
    );
  }

  return null;
}

// EPIC HALLOWEEN OVERLAY - This is where we go CRAZY! 🎃
// On mobile we reduce counts significantly for performance
function HalloweenOverlay() {
  // Multiple layers of spooky effects - reduced on mobile
  const ghosts = Array.from({length: getCount(8, 0.4)}, (_,i)=> i);
  const bats = Array.from({length: getCount(15, 0.3)}, (_,i)=> i);
  const pumpkins = Array.from({length: getCount(6, 0.5)}, (_,i)=> i);
  const spiders = Array.from({length: getCount(10, 0.3)}, (_,i)=> i);
  const eyes = Array.from({length: getCount(12, 0.3)}, (_,i)=> i);

  return (
    <div style={{position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0}}>
      <style>{`
        @keyframes ghost-float {
          0% { transform: translateY(120vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-20vh) translateX(50px) rotate(15deg); opacity: 0; }
        }

        @keyframes bat-swoop {
          0% { transform: translateX(-10vw) translateY(0) scaleX(1); }
          25% { transform: translateX(30vw) translateY(-20px) scaleX(1); }
          50% { transform: translateX(60vw) translateY(10px) scaleX(-1); }
          75% { transform: translateX(90vw) translateY(-15px) scaleX(-1); }
          100% { transform: translateX(110vw) translateY(0) scaleX(-1); }
        }

        @keyframes pumpkin-bounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes spider-drop {
          0% { transform: translateY(-50px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(90vh); opacity: 0; }
        }

        @keyframes eye-blink {
          0%, 90%, 100% { opacity: 1; transform: scaleY(1); }
          93%, 97% { opacity: 0; transform: scaleY(0.1); }
        }

        @keyframes fog-drift {
          0% { transform: translateX(-100%) translateY(0); opacity: 0.3; }
          50% { opacity: 0.5; }
          100% { transform: translateX(100%) translateY(-20px); opacity: 0.3; }
        }

        @keyframes web-shimmer {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Spooky fog layers - reduced blur on mobile for performance */}
      {!isMobile() && (
        <>
          <div style={{
            position:"absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: "linear-gradient(to top, rgba(100, 0, 150, 0.4) 0%, transparent 100%)",
            animation: "fog-drift 20s linear infinite",
            filter: "blur(8px)"
          }} />

          <div style={{
            position:"absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "30%",
            background: "linear-gradient(to top, rgba(50, 0, 80, 0.3) 0%, transparent 100%)",
            animation: "fog-drift 15s linear 5s infinite",
            filter: "blur(12px)"
          }} />
        </>
      )}

      {/* Spider webs in corners */}
      <div style={{
        position:"absolute",
        top: 0,
        left: 0,
        width: "200px",
        height: "200px",
        opacity: 0.3,
        animation: "web-shimmer 3s ease-in-out infinite",
        fontSize: "150px",
        transform: "rotate(-45deg)"
      }}>🕸️</div>

      <div style={{
        position:"absolute",
        top: 0,
        right: 0,
        width: "200px",
        height: "200px",
        opacity: 0.3,
        animation: "web-shimmer 3s ease-in-out 1.5s infinite",
        fontSize: "150px",
        transform: "rotate(45deg) scaleX(-1)"
      }}>🕸️</div>

      {/* Glowing eyes in the darkness */}
      {eyes.map(i => {
        const size = 15 + Math.random() * 15;
        return (
          <div key={`eyes-${i}`} style={{
            position:"absolute",
            top: `${10 + Math.random() * 40}%`,
            left: `${Math.random() * 100}%`,
            fontSize: `${size}px`,
            filter: "drop-shadow(0 0 8px #ff6600) drop-shadow(0 0 12px #ff3300)",
            animation: `eye-blink ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`
          }}>👀</div>
        );
      })}

      {/* Floating ghosts */}
      {ghosts.map(i => (
        <div key={`ghost-${i}`} style={{
          position:"absolute",
          bottom: "-20vh",
          left: `${Math.random()*90}%`,
          fontSize: 40 + Math.round(Math.random()*30),
          filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))",
          animation: `ghost-float ${15 + Math.random()*10}s linear ${Math.random()*8}s infinite`
        }}>👻</div>
      ))}

      {/* Swooping bats */}
      {bats.map(i => (
        <div key={`bat-${i}`} style={{
          position:"absolute",
          top: `${10 + Math.random()*50}%`,
          left: "-10vw",
          fontSize: 25 + Math.round(Math.random()*15),
          opacity: 0.8,
          animation: `bat-swoop ${8 + Math.random()*6}s linear ${Math.random()*5}s infinite`
        }}>🦇</div>
      ))}

      {/* Bouncing pumpkins at the bottom */}
      {pumpkins.map(i => (
        <div key={`pumpkin-${i}`} style={{
          position:"absolute",
          bottom: "10px",
          left: `${15 + i * 15}%`,
          fontSize: 35 + Math.round(Math.random()*20),
          filter: "drop-shadow(0 0 15px #ff6600)",
          animation: `pumpkin-bounce ${2 + Math.random()*2}s ease-in-out ${Math.random()*2}s infinite`
        }}>🎃</div>
      ))}

      {/* Dropping spiders on webs */}
      {spiders.map(i => (
        <div key={`spider-${i}`} style={{
          position:"absolute",
          top: "-50px",
          left: `${Math.random()*100}%`,
          fontSize: 20 + Math.round(Math.random()*15),
          opacity: 0.9,
          animation: `spider-drop ${12 + Math.random()*8}s linear ${Math.random()*10}s infinite`
        }}>
          <div style={{textAlign:"center"}}>
            <div style={{height:"50px", width:"2px", background:"rgba(200, 200, 200, 0.5)", margin:"0 auto"}} />
            <div>🕷️</div>
          </div>
        </div>
      ))}

      {/* Occasional skull */}
      <div style={{
        position:"absolute",
        top: "20%",
        right: "10%",
        fontSize: "60px",
        opacity: 0.3,
        filter: "drop-shadow(0 0 20px #00ff00)",
        animation: "eye-blink 5s ease-in-out infinite"
      }}>💀</div>
    </div>
  );
}
