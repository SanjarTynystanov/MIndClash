import { useState, useRef } from 'react';

export default function MagnetPuzzle({ onComplete }) {
  const [magnetPos, setMagnetPos] = useState({ x: 200, y: 250 });
  const [metalPos, setMetalPos] = useState({ x: 500, y: 250 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);
  
  const targetArea = { x: 650, y: 250 };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    x = Math.min(700, Math.max(50, x));
    y = Math.min(400, Math.max(100, y));
    setMagnetPos({ x, y });
    
    // Магнит притягивает металл
    const dx = magnetPos.x - metalPos.x;
    const dy = magnetPos.y - metalPos.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 100) {
      const force = (100 - distance) / 20;
      setMetalPos(prev => ({
        x: prev.x - dx * force * 0.05,
        y: prev.y - dy * force * 0.05
      }));
    }
  };
  
  const checkWin = () => {
    if (Math.hypot(metalPos.x - targetArea.x, metalPos.y - targetArea.y) < 30) {
      onComplete(true);
    } else {
      alert("Move the metal to the target area!");
    }
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧲 Magnet Puzzle</h2>
      <p style={styles.instruction}>Drag the magnet to pull the metal into the target zone!</p>
      
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={styles.canvas}
        onMouseDown={() => setIsDragging(true)}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
      />
      
      <button onClick={checkWin} style={styles.checkButton}>Check Position</button>
    </div>
  );
}

const styles = {
  container: { background: "#1a1a2e", borderRadius: "15px", padding: "30px", textAlign: "center" },
  title: { color: "#e94560", marginBottom: "10px" },
  instruction: { color: "#888", marginBottom: "20px" },
  canvas: { background: "#0a0a1a", borderRadius: "10px", margin: "20px 0", cursor: "pointer", border: "2px solid #333" },
  checkButton: { background: "#e94560", color: "white", border: "none", padding: "12px 30px", fontSize: "16px", borderRadius: "8px", cursor: "pointer" }
};