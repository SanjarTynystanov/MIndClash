import { useState, useEffect } from 'react';

export default function GravityJump({ onComplete }) {
  const [playerY, setPlayerY] = useState(350);
  const [velocity, setVelocity] = useState(0);
  const [gravity] = useState(0.5);
  const [platforms] = useState([
    { x: 100, y: 400, width: 80 },
    { x: 300, y: 350, width: 80 },
    { x: 500, y: 380, width: 80 },
    { x: 700, y: 360, width: 80 }
  ]);
  const [currentPlatform, setCurrentPlatform] = useState(0);
  const [score, setScore] = useState(0);
  
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setVelocity(v => v + gravity);
      setPlayerY(y => {
        const newY = y + velocity;
        const platform = platforms[currentPlatform];
        
        if (newY + 20 >= platform.y && newY - 20 <= platform.y + 10 &&
            Math.abs(100 + currentPlatform * 200 - platform.x) < 50) {
          setVelocity(-8);
          setScore(s => s + 10);
          
          if (currentPlatform + 1 < platforms.length) {
            setCurrentPlatform(i => i + 1);
          } else {
            clearInterval(gameLoop);
            setTimeout(() => onComplete(true), 500);
          }
        }
        
        if (newY > 500) {
          clearInterval(gameLoop);
          alert("Game Over! Try again!");
          window.location.reload();
        }
        
        return newY;
      });
    }, 20);
    
    return () => clearInterval(gameLoop);
  }, [velocity, gravity, currentPlatform]);
  
  const handleJump = () => {
    setVelocity(-8);
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚀 Gravity Jump</h2>
      <p style={styles.instruction}>Press SPACE or click to jump between platforms!</p>
      
      <div style={styles.gameArea}>
        <div style={{ ...styles.player, bottom: `${500 - playerY}px` }}>🐸</div>
        {platforms.map((p, i) => (
          <div key={i} style={{ ...styles.platform, left: `${p.x}px`, top: `${p.y}px` }}>
            {i <= currentPlatform ? "✅" : "⬜"}
          </div>
        ))}
      </div>
      
      <div style={styles.info}>
        <div>⭐ Score: {score}</div>
        <div>🌍 Gravity: {gravity.toFixed(1)}</div>
        <div>📊 Platform: {currentPlatform + 1}/{platforms.length}</div>
      </div>
      
      <button onClick={handleJump} style={styles.jumpButton}>JUMP 🦘</button>
    </div>
  );
}

const styles = {
  container: { background: "#1a1a2e", borderRadius: "15px", padding: "30px", textAlign: "center" },
  title: { color: "#e94560", marginBottom: "10px" },
  instruction: { color: "#888", marginBottom: "20px" },
  gameArea: { position: "relative", height: "500px", background: "#0a0a1a", borderRadius: "10px", margin: "20px 0", overflow: "hidden" },
  player: { position: "absolute", left: "100px", fontSize: "30px", transition: "bottom 0.02s linear" },
  platform: { position: "absolute", width: "80px", height: "20px", background: "#e94560", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center" },
  info: { display: "flex", justifyContent: "center", gap: "30px", color: "#fff", marginBottom: "20px" },
  jumpButton: { background: "#e94560", color: "white", border: "none", padding: "12px 30px", fontSize: "18px", borderRadius: "10px", cursor: "pointer" }
};