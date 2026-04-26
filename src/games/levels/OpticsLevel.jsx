import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_LIVES = 3;
const CANVAS_W = 820;
const CANVAS_H = 400;
const TARGET_X = 760;

// Levels for optics
const LEVELS = {
  1: { name: "Direct Hit", targetMovable: false, targetSpeed: 0, mirrors: [], timeLimit: 20 },
  2: { name: "Moving Target", targetMovable: true, targetSpeed: 0.5, targetRange: 60, mirrors: [], timeLimit: 25 },
  3: { name: "One Mirror", targetMovable: false, mirrors: [{ x: 350, y: 200, angle: 45, draggable: true }], timeLimit: 25 },
  4: { name: "Moving + Mirror", targetMovable: true, targetSpeed: 0.6, targetRange: 70, mirrors: [{ x: 350, y: 200, angle: 45, draggable: true }], timeLimit: 30 },
  5: { name: "Two Mirrors", targetMovable: false, mirrors: [
    { x: 280, y: 200, angle: 45, draggable: true },
    { x: 550, y: 200, angle: -45, draggable: true }
  ], timeLimit: 30 },
  6: { name: "Moving + Two", targetMovable: true, targetSpeed: 0.7, targetRange: 80, mirrors: [
    { x: 280, y: 200, angle: 45, draggable: true },
    { x: 550, y: 200, angle: -45, draggable: true }
  ], timeLimit: 35 },
  7: { name: "Three Mirrors", targetMovable: false, mirrors: [
    { x: 200, y: 200, angle: 45, draggable: true },
    { x: 400, y: 150, angle: -30, draggable: true },
    { x: 600, y: 250, angle: 30, draggable: true }
  ], timeLimit: 35 },
  8: { name: "Fast Target", targetMovable: true, targetSpeed: 1.0, targetRange: 90, mirrors: [
    { x: 300, y: 200, angle: 45, draggable: true },
    { x: 500, y: 200, angle: -45, draggable: true }
  ], timeLimit: 40 },
  9: { name: "Laser Maze", targetMovable: false, mirrors: [
    { x: 200, y: 250, angle: 45, draggable: true },
    { x: 400, y: 180, angle: -45, draggable: true },
    { x: 600, y: 280, angle: 45, draggable: true }
  ], timeLimit: 40 },
  10: { name: "FINAL BOSS", targetMovable: true, targetSpeed: 1.2, targetRange: 100, mirrors: [
    { x: 250, y: 200, angle: 45, draggable: true },
    { x: 420, y: 150, angle: -45, draggable: true },
    { x: 580, y: 250, angle: 45, draggable: true }
  ], timeLimit: 45 }
};

// Sound effects
let audioCtx = null;
const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

const playCorrect = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  } catch (err) {}
};

const playError = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 220;
    gain.gain.value = 0.3;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.stop(ctx.currentTime + 0.4);
  } catch (err) {}
};

export default function OpticsLevel({ level, onComplete }) {
  const levelNum = parseInt(level);
  const config = LEVELS[levelNum] || LEVELS[1];
  
  const [angle, setAngle] = useState(0);
  const [targetY, setTargetY] = useState(200);
  const [mirrors, setMirrors] = useState(config.mirrors.map(m => ({ ...m })));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 20);
  const [timeWarning, setTimeWarning] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [multiplier, setMultiplier] = useState(1);
  const [streak, setStreak] = useState(0);
  const [laserPoints, setLaserPoints] = useState([]);
  const [selectedMirror, setSelectedMirror] = useState(null);
  
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const animationRef = useRef(null);
  const dragRef = useRef(false);
  const isWinningRef = useRef(false);
  const audioResumed = useRef(false);
  
  const laser = { x: 50, y: 200 };
  const targetBaseY = 200;
  const targetRange = config.targetRange || 40;
  const targetSpeed = config.targetSpeed || 0;
  
  // Resume audio on first click
  useEffect(() => {
    const resumeAudio = () => {
      if (!audioResumed.current) {
        getAudioContext().resume();
        audioResumed.current = true;
      }
    };
    document.addEventListener('click', resumeAudio);
    return () => document.removeEventListener('click', resumeAudio);
  }, []);
  
  // Moving target animation
  useEffect(() => {
    if (!config.targetMovable || hasWon || isGameOver) return;
    
    let startTime = performance.now();
    const animate = (now) => {
      const elapsed = (now - startTime) / 1000;
      const newY = targetBaseY + Math.sin(elapsed * targetSpeed) * targetRange;
      setTargetY(Math.min(Math.max(newY, 50), 350));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [config.targetMovable, targetSpeed, targetRange, hasWon, isGameOver]);
  
  // Timer
  useEffect(() => {
    if (isGameOver || hasWon) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          playError();
          setLives(prevLives => {
            const newLives = prevLives - 1;
            if (newLives <= 0) {
              setIsGameOver(true);
              return 0;
            }
            setMessage('⏰ TIME\'S UP! -1 life');
            setTimeout(() => setMessage(''), 1500);
            setTimeLeft(config.timeLimit || 20);
            return newLives;
          });
          return 0;
        }
        if (prev <= 6) setTimeWarning(true);
        else setTimeWarning(false);
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerRef.current);
  }, [isGameOver, hasWon, config.timeLimit]);
  
  // Calculate laser path with proper hit detection
  const calculateLaserPath = useCallback(() => {
    let points = [{ x: laser.x, y: laser.y }];
    let currentX = laser.x;
    let currentY = laser.y;
    let currentAngle = angle;
    let hitTarget = false;
    let finalPoint = null;
    let bounceCount = 0;
    let maxBounces = 15;
    
    while (bounceCount < maxBounces && !hitTarget) {
      const rad = currentAngle * Math.PI / 180;
      const dx = Math.cos(rad);
      const dy = Math.sin(rad);
      
      let minT = Infinity;
      let hitPoint = null;
      let hitMirror = null;
      
      // Check canvas boundaries
      let t = Infinity;
      if (dx > 0) t = Math.min(t, (CANVAS_W - currentX) / dx);
      if (dx < 0) t = Math.min(t, (0 - currentX) / dx);
      if (dy > 0) t = Math.min(t, (CANVAS_H - currentY) / dy);
      if (dy < 0) t = Math.min(t, (0 - currentY) / dy);
      if (t > 0 && t < minT) {
        minT = t;
        hitPoint = { x: currentX + dx * t, y: currentY + dy * t };
        hitMirror = null;
      }
      
      // Check mirrors
      for (const mirror of mirrors) {
        const dxToMirror = mirror.x - currentX;
        const dyToMirror = mirror.y - currentY;
        const t = (dxToMirror * dx + dyToMirror * dy) / (dx * dx + dy * dy);
        
        if (t > 0.05 && t < minT) {
          const intersectX = currentX + dx * t;
          const intersectY = currentY + dy * t;
          const distToMirror = Math.hypot(intersectX - mirror.x, intersectY - mirror.y);
          
          if (distToMirror < 25) {
            minT = t;
            hitPoint = { x: intersectX, y: intersectY };
            hitMirror = mirror;
          }
        }
      }
      
      if (minT === Infinity) break;
      
      points.push(hitPoint);
      
      // Check line-circle collision with target
      const x1 = points[points.length - 2].x;
      const y1 = points[points.length - 2].y;
      const x2 = hitPoint.x;
      const y2 = hitPoint.y;
      
      const dxLine = x2 - x1;
      const dyLine = y2 - y1;
      const fx = x1 - TARGET_X;
      const fy = y1 - targetY;
      const a = dxLine * dxLine + dyLine * dyLine;
      const b = 2 * (fx * dxLine + fy * dyLine);
      const c = fx * fx + fy * fy - 18 * 18;
      const discriminant = b * b - 4 * a * c;
      
      if (discriminant >= 0) {
        const tHit = (-b - Math.sqrt(discriminant)) / (2 * a);
        if (tHit >= 0 && tHit <= 1) {
          hitTarget = true;
          finalPoint = {
            x: x1 + dxLine * tHit,
            y: y1 + dyLine * tHit
          };
          points.push(finalPoint);
          break;
        }
      }
      
      if (hitMirror) {
        const mirrorAngleRad = hitMirror.angle * Math.PI / 180;
        const normalAngle = mirrorAngleRad;
        const incidentAngle = currentAngle * Math.PI / 180;
        let reflectedAngle = 2 * normalAngle - incidentAngle;
        currentAngle = reflectedAngle * 180 / Math.PI;
        currentX = hitPoint.x;
        currentY = hitPoint.y;
        bounceCount++;
      } else {
        break;
      }
    }
    
    return { points, hitTarget };
  }, [angle, mirrors, targetY]);
  
  // Update laser and check win condition
  useEffect(() => {
    const { points, hitTarget } = calculateLaserPath();
    setLaserPoints(points);
    
    if (hitTarget && !hasWon && !isGameOver && !isWinningRef.current) {
      isWinningRef.current = true;
      playCorrect();
      
      const newStreak = streak + 1;
      const newMultiplier = Math.min(1 + Math.floor(newStreak / 2) * 0.25, 2.5);
      const pointsEarned = Math.floor(100 * newMultiplier);
      const finalScore = score + pointsEarned;
      
      setStreak(newStreak);
      setMultiplier(newMultiplier);
      setScore(finalScore);
      setMessage(`🎯 LASER LOCK! +${pointsEarned} points!`);
      
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      setTimeout(() => {
        setHasWon(true);
        onComplete({ 
          success: true, 
          win: true, 
          score: finalScore, 
          total: 1, 
          perfect: lives === MAX_LIVES,
          level: levelNum
        });
      }, 800);
    }
  }, [calculateLaserPath, hasWon, isGameOver, streak, score, lives, levelNum, onComplete]);
  
  // Mouse handlers for mirrors
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    for (let i = 0; i < mirrors.length; i++) {
      const m = mirrors[i];
      if (Math.hypot(mouseX - m.x, mouseY - m.y) < 20 && m.draggable) {
        setSelectedMirror(i);
        dragRef.current = true;
        break;
      }
    }
  };
  
  const handleMouseMove = (e) => {
    if (!dragRef.current || selectedMirror === null) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let mouseX = (e.clientX - rect.left) * scaleX;
    let mouseY = (e.clientY - rect.top) * scaleY;
    
    mouseX = Math.min(Math.max(mouseX, 40), CANVAS_W - 40);
    mouseY = Math.min(Math.max(mouseY, 40), CANVAS_H - 40);
    
    const newMirrors = [...mirrors];
    newMirrors[selectedMirror] = { ...newMirrors[selectedMirror], x: mouseX, y: mouseY };
    setMirrors(newMirrors);
  };
  
  const handleMouseUp = () => {
    dragRef.current = false;
    setSelectedMirror(null);
  };
  
  const handleWheel = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    for (let i = 0; i < mirrors.length; i++) {
      const m = mirrors[i];
      if (Math.hypot(mouseX - m.x, mouseY - m.y) < 20 && m.draggable) {
        const delta = e.deltaY > 0 ? -5 : 5;
        const newAngle = (m.angle + delta + 360) % 360;
        const newMirrors = [...mirrors];
        newMirrors[i] = { ...newMirrors[i], angle: newAngle };
        setMirrors(newMirrors);
        break;
      }
    }
  };
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: W, height: H } = canvas;
    
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d1a2e';
    ctx.fillRect(0, 0, W, H);
    
    // Grid
    ctx.strokeStyle = 'rgba(56, 139, 253, 0.05)';
    for(let i=0; i<W; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke(); }
    for(let i=0; i<H; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(W,i); ctx.stroke(); }
    
    // Laser beam
    if (laserPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#f85149';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#f85149';
      for (let i = 0; i < laserPoints.length; i++) {
        if (i === 0) ctx.moveTo(laserPoints[i].x, laserPoints[i].y);
        else ctx.lineTo(laserPoints[i].x, laserPoints[i].y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Mirrors
    mirrors.forEach(mirror => {
      const rad = mirror.angle * Math.PI / 180;
      const length = 35;
      const x1 = mirror.x - length * Math.cos(rad);
      const y1 = mirror.y - length * Math.sin(rad);
      const x2 = mirror.x + length * Math.cos(rad);
      const y2 = mirror.y + length * Math.sin(rad);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#FAC775';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(mirror.x, mirror.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#FAC775';
      ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.arc(mirror.x, mirror.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Laser source
    ctx.beginPath();
    ctx.arc(laser.x, laser.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#f85149';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(laser.x, laser.y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Target
    ctx.beginPath();
    ctx.arc(TARGET_X, targetY, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#4fc3f7';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(TARGET_X, targetY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Hit effect
    const lastPoint = laserPoints[laserPoints.length - 1];
    if (lastPoint && Math.hypot(lastPoint.x - TARGET_X, lastPoint.y - targetY) < 20) {
      ctx.beginPath();
      ctx.arc(TARGET_X, targetY, 25, 0, Math.PI * 2);
      ctx.strokeStyle = '#4fc3f7';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(TARGET_X, targetY, 30, 0, Math.PI * 2);
      ctx.strokeStyle = '#f85149';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [laserPoints, mirrors, targetY]);
  
  useEffect(() => {
    draw();
  }, [draw]);
  
  const handleRestart = () => {
    isWinningRef.current = false;
    setLives(MAX_LIVES);
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setIsGameOver(false);
    setHasWon(false);
    setMessage('');
    setAngle(0);
    setMirrors(config.mirrors.map(m => ({ ...m })));
    setTimeLeft(config.timeLimit || 20);
    setTimeWarning(false);
    setTargetY(targetBaseY);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };
  
  const renderLives = () => '▮'.repeat(lives) + '▯'.repeat(MAX_LIVES - lives);
  const timerPercent = (timeLeft / (config.timeLimit || 20)) * 100;
  
  if (hasWon) {
    const isPerfect = lives === MAX_LIVES && streak >= 1;
    return (
      <div style={styles.winScreen}>
        <div style={styles.winContent}>
          <div style={styles.winEmoji}>🏆✨🔦✨🏆</div>
          <div style={styles.winTitle}>VICTORY!</div>
          <div style={styles.winScore}>SCORE: {score}</div>
          {isPerfect && <div style={styles.perfectBadge}>💯 PERFECT!</div>}
          <div style={styles.winButtons}>
            <button onClick={() => window.location.reload()} style={styles.nextBtn}>PLAY AGAIN</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (isGameOver) {
    return (
      <div style={styles.gameoverScreen}>
        <div style={styles.gameoverContent}>
          <div style={styles.gameoverEmoji}>💀🔦💀</div>
          <div style={styles.gameoverTitle}>GAME OVER</div>
          <div style={styles.gameoverScore}>FINAL SCORE: {score}</div>
          <button onClick={handleRestart} style={styles.restartBtn}>RETRY</button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div style={styles.statGroup}>
            <span>SYSTEM INTEGRITY:</span>
            <span style={{ color: '#f85149' }}>{renderLives()}</span>
          </div>
          <div style={styles.statGroup}>
            <span>⭐</span>
            <span>{score}</span>
          </div>
          {multiplier > 1 && <div style={styles.multiplierBadge}>x{multiplier.toFixed(1)}</div>}
          <div style={{ ...styles.statGroup, ...(timeWarning && styles.timerWarning) }}>
            <span>⏱️</span>
            <span>{timeLeft}s</span>
          </div>
        </div>
        
        <div style={styles.timerBar}>
          <div style={{ ...styles.timerFill, width: `${timerPercent}%`, background: timeLeft <= 5 ? '#f85149' : '#e94560' }} />
        </div>
        
        {timeWarning && <div style={styles.redFlash} />}
        
        <div style={styles.header}>
          <span style={styles.badge}>LEVEL {levelNum}: {config.name}</span>
          <span style={styles.description}>
            {config.targetMovable ? '🎯 Moving target! ' : ''}
            {mirrors.length > 0 ? `🪞 ${mirrors.length} mirrors` : '🎯 Direct hit'}
          </span>
        </div>
        
        <canvas 
          ref={canvasRef} 
          width={CANVAS_W} 
          height={CANVAS_H} 
          style={styles.canvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />
        
        <div style={styles.controls}>
          <div style={styles.slGroup}>
            <div style={styles.slLabel}>🔦 LASER ANGLE</div>
            <div style={styles.slValue}>{angle}°</div>
            <input 
              type="range" 
              min="-60" 
              max="60" 
              value={angle} 
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="physics-range"
            />
          </div>
          <div style={styles.infoBox}>
            <div style={styles.infoText}>
              💡 CONTROLS:<br/>
              • 🖱️ Drag mirrors to move<br/>
              • 🔄 Scroll wheel to rotate<br/>
              • 🎯 Aim laser at the target
            </div>
          </div>
        </div>
        
        {message && <div style={styles.message}>{message}</div>}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: { display: "flex", justifyContent: "center", alignItems: "center", width: "100%", minHeight: "100vh", padding: "20px", background: "#0a0a1a" },
  container: { background: "#0d1117", padding: "24px", borderRadius: "16px", border: "1px solid #30363d", color: "#c9d1d9", width: "900px", boxShadow: "0 0 40px rgba(0,0,0,0.4)" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", padding: "12px 16px", background: "#161b22", borderRadius: "8px" },
  statGroup: { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#FAC775" },
  multiplierBadge: { background: "#e94560", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" },
  timerWarning: { animation: "pulse 0.5s infinite", color: "#f85149" },
  timerBar: { height: "4px", background: "#30363d", borderRadius: "2px", marginBottom: "20px", overflow: "hidden" },
  timerFill: { height: "100%", transition: "width 0.3s linear" },
  redFlash: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(233,69,96,0.2)", pointerEvents: "none", zIndex: 100, animation: "flash 0.5s infinite" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "16px", fontFamily: "monospace", flexWrap: "wrap", gap: "10px" },
  badge: { color: "#58a6ff", fontWeight: "bold" },
  description: { color: "#8b949e", fontSize: "12px" },
  canvas: { width: "100%", background: "#0d1a2e", borderRadius: "8px", border: "1px solid #30363d", cursor: "crosshair" },
  controls: { display: "flex", gap: "25px", marginTop: "20px", background: "#161b22", padding: "20px", borderRadius: "12px", alignItems: "flex-end", flexWrap: "wrap" },
  slGroup: { display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "200px" },
  slLabel: { fontSize: "12px", color: "#8b949e", fontWeight: "bold", letterSpacing: "1px" },
  slValue: { fontSize: "28px", color: "#FAC775", fontWeight: "bold", fontFamily: "monospace" },
  infoBox: { flex: 1, minWidth: "200px", padding: "8px 12px", background: "rgba(79,195,247,0.1)", borderRadius: "8px" },
  infoText: { fontSize: "11px", color: "#4fc3f7", lineHeight: "1.4" },
  message: { marginTop: "15px", padding: "10px", background: "rgba(79,195,247,0.2)", borderRadius: "8px", textAlign: "center", color: "#4fc3f7" },
  winScreen: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, #0a1a0f 0%, #0d1117 100%)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  winContent: { textAlign: "center", background: "rgba(0,0,0,0.8)", padding: "40px", borderRadius: "24px", border: "2px solid #4fc3f7", backdropFilter: "blur(10px)", maxWidth: "500px" },
  winEmoji: { fontSize: "64px", marginBottom: "16px" },
  winTitle: { fontSize: "36px", fontWeight: "800", color: "#4fc3f7", marginBottom: "16px" },
  winScore: { fontSize: "24px", fontWeight: "600", color: "#5DCAA5", marginBottom: "8px" },
  perfectBadge: { color: "#FFD700", fontWeight: "bold", marginTop: "10px", marginBottom: "16px", fontSize: "18px" },
  winButtons: { display: "flex", gap: "16px", justifyContent: "center", marginTop: "20px" },
  nextBtn: { background: "linear-gradient(135deg, #1D9E75, #157a58)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
  restartBtn: { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "12px 24px", borderRadius: "8px", fontSize: "16px", cursor: "pointer" },
  gameoverScreen: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, #1a0a0a 0%, #0d1117 100%)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  gameoverContent: { textAlign: "center", background: "rgba(0,0,0,0.8)", padding: "40px", borderRadius: "24px", border: "2px solid #D85A30", backdropFilter: "blur(10px)", maxWidth: "500px" },
  gameoverEmoji: { fontSize: "64px", marginBottom: "16px" },
  gameoverTitle: { fontSize: "36px", fontWeight: "800", color: "#D85A30", marginBottom: "16px" },
  gameoverScore: { fontSize: "24px", fontWeight: "600", color: "#5DCAA5", marginBottom: "16px" },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes flash { 0%,100% { opacity: 0; } 50% { opacity: 1; } }
    input.physics-range {
      width: 100%;
      height: 25px;
      -webkit-appearance: none;
      background: transparent;
      cursor: pointer;
    }
    .physics-range::-webkit-slider-runnable-track {
      height: 10px;
      background: linear-gradient(90deg, #4fc3f7, #FAC775);
      border-radius: 6px;
    }
    .physics-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 22px;
      height: 22px;
      background: #fff;
      border-radius: 50%;
      margin-top: -6px;
      cursor: pointer;
      border: 3px solid #4fc3f7;
      box-shadow: 0 0 12px rgba(79,195,247,0.7);
    }
  `;
  document.head.appendChild(style);
}