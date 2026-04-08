import { useState, useRef, useEffect, useCallback } from "react";
import { translations } from "../i18n/translations";

export default function PhysicsGame({ level, lang, onComplete }) {
  const t = translations[lang];
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(50);
  const [isFlying, setIsFlying] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const targetX = 400;
  const targetY = 100;
  const gravity = 9.8;
  const scale = 2; // pixels per meter

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = "#4a5568";
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // Cannon
    ctx.fillStyle = "#2d3748";
    ctx.fillRect(50, canvas.height - 70, 20, 50);

    // Target
    ctx.fillStyle = "#e53e3e";
    ctx.fillRect(targetX - 10, canvas.height - targetY - 10, 20, 20);

    // Trajectory preview
    if (!isFlying) {
      ctx.strokeStyle = "#3182ce";
      ctx.beginPath();
      for (let t = 0; t < 2; t += 0.1) {
        const x = 70 + velocity * Math.cos(angle * Math.PI / 180) * t * scale;
        const y = canvas.height - 50 - (velocity * Math.sin(angle * Math.PI / 180) * t - 0.5 * gravity * t * t) * scale;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [angle, velocity, isFlying]);

  useEffect(() => {
    drawScene();
  }, [angle, velocity, isFlying, drawScene]);

  const shoot = () => {
    if (isFlying) return;
    setIsFlying(true);
    setAttempts(a => a + 1);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let t = 0;
    const interval = setInterval(() => {
      t += 0.1;
      const x = 70 + velocity * Math.cos(angle * Math.PI / 180) * t * scale;
      const y = canvas.height - 50 - (velocity * Math.sin(angle * Math.PI / 180) * t - 0.5 * gravity * t * t) * scale;

      if (x > canvas.width || y > canvas.height - 20) {
        setIsFlying(false);
        clearInterval(interval);
        return;
      }

      // Check hit
      if (Math.abs(x - targetX) < 10 && Math.abs((canvas.height - y) - targetY) < 10) {
        setScore(s => s + 100);
        setIsFlying(false);
        clearInterval(interval);
        onComplete(100);
        return;
      }

      drawScene();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }, 50);
  };

  return (
    <div className="page animate-in">
      <h2>{t.physics} {t.level} {level}: {t.shootTarget}</h2>
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <div>
          <label>{t.angle}: {angle}°</label>
          <input type="range" min="0" max="90" value={angle} onChange={e => setAngle(+e.target.value)} />
        </div>
        <div>
          <label>{t.velocity}: {velocity} m/s</label>
          <input type="range" min="10" max="100" value={velocity} onChange={e => setVelocity(+e.target.value)} />
        </div>
        <button onClick={shoot} disabled={isFlying}>{t.shoot}</button>
      </div>
      <canvas ref={canvasRef} width="600" height="300" style={{ border: "1px solid #ccc", marginTop: "20px" }} />
      <p>{t.score}: {score} | {t.attempts}: {attempts}</p>
    </div>
  );
}