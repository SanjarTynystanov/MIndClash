import { useState, useRef, useEffect } from 'react';

export default function AngleShot({ onComplete }) {
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [bird, setBird] = useState({ x: 100, y: 400, launched: false });
  const canvasRef = useRef(null);
  
  const target = { x: 700, y: 350 };
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    drawGame();
  }, [angle, power, bird]);
  
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 500);
    
    // Небо
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 800, 450);
    
    // Земля
    ctx.fillStyle = '#5c8a3c';
    ctx.fillRect(0, 430, 800, 70);
    
    // Рогатка
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(80, 400, 10, 50);
    ctx.fillRect(110, 400, 10, 50);
    ctx.beginPath();
    ctx.moveTo(85, 400);
    ctx.lineTo(105, 370);
    ctx.lineTo(115, 400);
    ctx.fill();
    
    // Резинка при натяжении
    if (isDragging) {
      ctx.beginPath();
      ctx.moveTo(90, 400);
      ctx.lineTo(dragStart.x, dragStart.y);
      ctx.lineTo(110, 400);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // Птица
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bird.x - 4, bird.y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x - 5, bird.y - 4, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Цель
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(target.x, target.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(target.x, target.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(target.x, target.y, 5, 0, Math.PI * 2);
    ctx.fill();
  };
  
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (Math.hypot(x - 100, y - 400) < 30) {
      setIsDragging(true);
      setDragStart({ x, y });
    }
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y });
    
    // Вычисляем угол и силу
    const dx = 100 - x;
    const dy = 400 - y;
    const newAngle = Math.atan2(-dy, dx) * 180 / Math.PI;
    const newPower = Math.min(100, Math.hypot(dx, dy) / 3);
    setAngle(Math.min(90, Math.max(0, newAngle)));
    setPower(newPower);
  };
  
  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    launchBird();
  };
  
  const launchBird = () => {
    const angleRad = (angle * Math.PI) / 180;
    const v0 = power / 5;
    let x = 100;
    let y = 400;
    let vx = v0 * Math.cos(angleRad);
    let vy = -v0 * Math.sin(angleRad);
    let t = 0;
    
    const animate = () => {
      t += 0.05;
      x = 100 + vx * t * 20;
      y = 400 + vy * t * 20 + 0.5 * 9.8 * t * t * 20;
      
      setBird({ x, y, launched: true });
      drawGame();
      
      const distToTarget = Math.hypot(x - target.x, y - target.y);
      if (distToTarget < 25) {
        setTimeout(() => onComplete(true), 500);
        return;
      }
      
      if (y > 500 || x > 800 || x < 0) {
        setTimeout(() => {
          alert("Missed! Try again!");
          setBird({ x: 100, y: 400, launched: false });
        }, 100);
        return;
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎯 Angle Shot - Hit the Target!</h2>
      <p style={styles.instruction}>Drag the bird backwards to aim and shoot!</p>
      
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={styles.canvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      
      <div style={styles.info}>
        <div>Angle: {Math.round(angle)}°</div>
        <div>Power: {Math.round(power)}%</div>
      </div>
    </div>
  );
}

const styles = {
  container: { background: "#1a1a2e", borderRadius: "15px", padding: "30px", textAlign: "center" },
  title: { color: "#e94560", marginBottom: "10px" },
  instruction: { color: "#888", marginBottom: "20px" },
  canvas: { background: "#87CEEB", borderRadius: "10px", margin: "20px 0", cursor: "pointer", border: "2px solid #333" },
  info: { display: "flex", justifyContent: "center", gap: "30px", color: "#fff", fontSize: "18px" }
};