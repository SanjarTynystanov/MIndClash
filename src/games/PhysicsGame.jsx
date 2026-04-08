// import { useState, useRef, useEffect, useCallback } from "react";
// import { translations } from "../i18n/translations";

// export default function PhysicsGame({ level, lang, onComplete }) {
//   const t = translations[lang];
//   const canvasRef = useRef(null);
//   const [angle, setAngle] = useState(45);
//   const [velocity, setVelocity] = useState(50);
//   const [isFlying, setIsFlying] = useState(false);
//   const [score, setScore] = useState(0);
//   const [attempts, setAttempts] = useState(0);

//   const targetX = 400;
//   const targetY = 100;
//   const gravity = 9.8;
//   const scale = 2; // pixels per meter

//   const drawScene = useCallback(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Ground
//     ctx.fillStyle = "#4a5568";
//     ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

//     // Cannon
//     ctx.fillStyle = "#2d3748";
//     ctx.fillRect(50, canvas.height - 70, 20, 50);

//     // Target
//     ctx.fillStyle = "#e53e3e";
//     ctx.fillRect(targetX - 10, canvas.height - targetY - 10, 20, 20);

//     // Trajectory preview
//     if (!isFlying) {
//       ctx.strokeStyle = "#3182ce";
//       ctx.beginPath();
//       for (let t = 0; t < 2; t += 0.1) {
//         const x = 70 + velocity * Math.cos(angle * Math.PI / 180) * t * scale;
//         const y = canvas.height - 50 - (velocity * Math.sin(angle * Math.PI / 180) * t - 0.5 * gravity * t * t) * scale;
//         if (t === 0) ctx.moveTo(x, y);
//         else ctx.lineTo(x, y);
//       }
//       ctx.stroke();
//     }
//   }, [angle, velocity, isFlying]);

//   useEffect(() => {
//     drawScene();
//   }, [angle, velocity, isFlying, drawScene]);

//   const shoot = () => {
//     if (isFlying) return;
//     setIsFlying(true);
//     setAttempts(a => a + 1);
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     let t = 0;
//     const interval = setInterval(() => {
//       t += 0.1;
//       const x = 70 + velocity * Math.cos(angle * Math.PI / 180) * t * scale;
//       const y = canvas.height - 50 - (velocity * Math.sin(angle * Math.PI / 180) * t - 0.5 * gravity * t * t) * scale;

//       if (x > canvas.width || y > canvas.height - 20) {
//         setIsFlying(false);
//         clearInterval(interval);
//         return;
//       }

//       // Check hit
//       if (Math.abs(x - targetX) < 10 && Math.abs((canvas.height - y) - targetY) < 10) {
//         setScore(s => s + 100);
//         setIsFlying(false);
//         clearInterval(interval);
//         onComplete(100);
//         return;
//       }

//       drawScene();
//       ctx.fillStyle = "#000";
//       ctx.beginPath();
//       ctx.arc(x, y, 5, 0, 2 * Math.PI);
//       ctx.fill();
//     }, 50);
//   };

//   return (
//     <div className="page animate-in">
//       <h2>{t.physics} {t.level} {level}: {t.shootTarget}</h2>
//       <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
//         <div>
//           <label>{t.angle}: {angle}°</label>
//           <input type="range" min="0" max="90" value={angle} onChange={e => setAngle(+e.target.value)} />
//         </div>
//         <div>
//           <label>{t.velocity}: {velocity} m/s</label>
//           <input type="range" min="10" max="100" value={velocity} onChange={e => setVelocity(+e.target.value)} />
//         </div>
//         <button onClick={shoot} disabled={isFlying}>{t.shoot}</button>
//       </div>
//       <canvas ref={canvasRef} width="600" height="300" style={{ border: "1px solid #ccc", marginTop: "20px" }} />
//       <p>{t.score}: {score} | {t.attempts}: {attempts}</p>
//     </div>
//   );
// }
import { useState, useRef } from 'react';

export default function PhysicsGame({ onComplete }) {
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const canvasRef = useRef(null);
  
  const targetX = 700;
  const targetY = 380;
  
  const drawScene = (shotX = null, shotY = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 500);
    
    // Небо
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 800, 450);
    
    // Земля
    ctx.fillStyle = '#37700b';
    ctx.fillRect(0, 430, 800, 70);
    
    // Пушка
    ctx.fillStyle = '#79390a';
    ctx.fillRect(50, 410, 60, 25);
    
    // Ствол
    ctx.save();
    ctx.translate(80, 422);
    ctx.rotate((angle * Math.PI) / 360);
    ctx.fillStyle = '#514f4d';
    ctx.fillRect(0, -8, 70, 16);
    ctx.restore();
    
    // Колеса
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(60, 435, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, 435, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Мишень
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Ядро
    if (shotX && shotY) {
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.arc(shotX, shotY, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  const fireCannon = () => {
    setMessage('');
    drawScene();
    
    const angleRad = (angle * Math.PI) / 180;
    const v0 = power / 4;
    let x = 90;
    let y = 422;
    let vx = v0 * Math.cos(angleRad);
    let vy = -v0 * Math.sin(angleRad);
    let t = 0;
    let animationId;
    
    const animate = () => {
      t += 0.05;
      x = 90 + vx * t * 15;
      y = 422 + vy * t * 15 + 0.5 * 9.8 * t * t * 15;
      
      drawScene(x, y);
      
      // Попадание
      if (x >= targetX - 15 && x <= targetX + 15 && y >= targetY - 15 && y <= targetY + 15) {
        cancelAnimationFrame(animationId);
        setScore(score + 50);
        setMessage('🎯 HIT! +50 points!');
        setTimeout(() => onComplete(true), 1000);
        return;
      }
      
      // Промах
      if (y > 450 || x > 800 || x < 0) {
        cancelAnimationFrame(animationId);
        setMessage('❌ Missed! Try again!');
        drawScene();
        setTimeout(() => setMessage(''), 1500);
        return;
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎯 Cannon Game</h2>
      <p style={styles.question}>Hit the red target!</p>
      
      <canvas ref={canvasRef} width={800} height={500} style={styles.canvas}></canvas>
      
      <div style={styles.controls}>
        <div>
          <label>Angle: {angle}° </label>
          <input type="range" min="0" max="90" value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
        </div>
        <div>
          <label>Power: {power}% </label>
          <input type="range" min="10" max="100" value={power} onChange={(e) => setPower(Number(e.target.value))} />
        </div>
        <button onClick={fireCannon} style={styles.fireButton}>🔥 FIRE!</button>
      </div>
      
      {message && <div style={styles.message}>{message}</div>}
      <div style={styles.score}>⭐ Score: {score}</div>
    </div>
  );
}

const styles = {
  container: { background: "#1a1a2e", borderRadius: "15px", padding: "30px", textAlign: "center" },
  title: { color: "#e94560", marginBottom: "10px" },
  question: { color: "#fff", fontSize: "18px", marginBottom: "20px" },
  canvas: { background: "#87CEEB", borderRadius: "10px", margin: "20px 0", border: "2px solid #333" },
  controls: { display: "flex", justifyContent: "center", gap: "20px", alignItems: "center", flexWrap: "wrap", marginBottom: "20px" },
  fireButton: { background: "#e94560", color: "white", border: "none", padding: "10px 25px", fontSize: "16px", borderRadius: "8px", cursor: "pointer" },
  message: { marginTop: "15px", fontSize: "20px", fontWeight: "bold", color: "#ffd700" },
  score: { marginTop: "10px", fontSize: "20px", color: "#e94560" }
};