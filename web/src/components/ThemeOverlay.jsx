import React from "react";

export function ThemeOverlay({ effects }) {
  if (!effects) return null;

  // Bats effect (Halloween)
  if (effects.bats) {
    const bats = Array.from({length: 10}, (_,i)=> i);
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

  // Snow effect (Winter)
  if (effects.snow) {
    const flakes = Array.from({length:40}, (_,i)=>i);
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

  // Balloons effect (Birthday)
  if (effects.balloons) {
    const balloons = Array.from({length: 15}, (_,i)=> i);
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

  // Confetti background effect (Birthday)
  if (effects.confetti) {
    const confetti = Array.from({length: 30}, (_,i)=> i);
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

  // Sparkles effect (Unicorn)
  if (effects.sparkles) {
    const sparkles = Array.from({length: 25}, (_,i)=> i);
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

  // Rainbows effect (Unicorn)
  if (effects.rainbows) {
    const rainbows = Array.from({length: 8}, (_,i)=> i);
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

  // Stars effect (Space)
  if (effects.stars) {
    const stars = Array.from({length: 50}, (_,i)=> i);
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

  // Planets effect (Space)
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

  // Fish effect (Ocean)
  if (effects.fish) {
    const fish = Array.from({length: 12}, (_,i)=> i);
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

  // Bubbles effect (Ocean)
  if (effects.bubbles) {
    const bubbles = Array.from({length: 30}, (_,i)=> i);
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
