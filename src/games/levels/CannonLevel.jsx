import { useState, useRef, useEffect, useCallback } from 'react';

const G = 9.8;
const MAX_LIVES = 3;
const SC = 820 / 220; 

const LEVELS = [
  { id: 1, name: "Static Target", wind: 0, targets: [{ xm: 150, ym: 0, r: 16, moving: false }], obstacles: [], laserOn: false, magnetOn: false, timeLimit: 20 },
  { id: 2, name: "Moving Target", wind: 0, targets: [{ xm: 150, ym: 0, r: 16, moving: true, speed: 0.4, phase: 0, amp: 22 }], obstacles: [], laserOn: false, magnetOn: false, timeLimit: 20 },
  { id: 3, name: "Wind + Barrier", wind: 0.6, targets: [{ xm: 170, ym: 0, r: 16, moving: false }], obstacles: [{ xm: 110, ym: 0, w: 3, h: 55 }], laserOn: false, magnetOn: false, timeLimit: 20 },
  { id: 4, name: "Laser Zone", wind: 0.3, targets: [{ xm: 160, ym: 0, r: 16, moving: true, speed: 0.3, phase: 0, amp: 18 }], obstacles: [], laserOn: true, laserY: 55, magnetOn: false, timeLimit: 20 },
  { id: 5, name: "Magnetic Chaos", wind: 0, targets: [{ xm: 160, ym: 0, r: 16, moving: true, speed: 0.4, phase: 0, amp: 20 }], obstacles: [], laserOn: false, magnetOn: true, magnetXm: 130, magnetYm: 60, magnetF: 25, timeLimit: 20 },
  { id: 6, name: "Fast Target", wind: 0.4, targets: [{ xm: 165, ym: 0, r: 14, moving: true, speed: 0.9, phase: 0, amp: 28 }], obstacles: [], laserOn: false, magnetOn: false, timeLimit: 20 },
  { id: 7, name: "Wind + Moving Target", wind: -0.5, targets: [{ xm: 165, ym: 0, r: 14, moving: true, speed: 0.7, phase: 0, amp: 22 }], obstacles: [{ xm: 100, ym: 0, w: 3, h: 50 }], laserOn: false, magnetOn: false, timeLimit: 20 },
  { id: 8, name: "Double Obstacle", wind: 0.4, targets: [{ xm: 175, ym: 0, r: 16, moving: false }], obstacles: [{ xm: 90, ym: 0, w: 3, h: 55 }, { xm: 135, ym: 0, w: 3, h: 50 }], laserOn: false, magnetOn: false, timeLimit: 20 },
  { id: 9, name: "Magnetic + Laser", wind: 0.2, targets: [{ xm: 160, ym: 0, r: 14, moving: true, speed: 0.5, phase: 0, amp: 18 }], obstacles: [], laserOn: true, laserY: 65, magnetOn: true, magnetXm: 140, magnetYm: 75, magnetF: 30, timeLimit: 20 },
  { id: 10, name: "FINAL BOSS", wind: 0.7, targets: [{ xm: 180, ym: 0, r: 12, moving: true, speed: 1.2, phase: 0, amp: 35 }], obstacles: [{ xm: 80, ym: 0, w: 3, h: 65 }, { xm: 145, ym: 0, w: 3, h: 55 }], laserOn: true, laserY: 50, magnetOn: true, magnetXm: 125, magnetYm: 95, magnetF: 35, timeLimit: 20 }
];

const px = (xm) => xm * SC;
const py = (ym, h) => h - 38 - ym * SC;

export default function CannonLevel({ level, onComplete }) {
  const lvlIdx = (parseInt(level) || 1) - 1;
  const lvl = LEVELS[lvlIdx] || LEVELS[0];

  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [timeLeft, setTimeLeft] = useState(20);
  const [timeWarning, setTimeWarning] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [streak, setStreak] = useState(0);
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const stateRef = useRef({
    t: 0, bx: 10, by: 2, vx: 0, vy: 0, mvx: 0, mvy: 0, phase: 0,
    trail: [], shake: 0
  });

  // Timer - 20 seconds, lose life on timeout
  useEffect(() => {
    if (isGameOver || hasWon) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // TIME'S UP - lose a life!
          setLives(prevLives => {
            const newLives = prevLives - 1;
            if (newLives <= 0) {
              setIsGameOver(true);
              return 0;
            }
            setMessage({ text: '⏰ TIME\'S UP! -1 life', type: 'err' });
            setTimeout(() => setMessage({ text: '', type: '' }), 1500);
            setTimeLeft(20);
            // Reset cannon position
            setIsFlying(false);
            stateRef.current = {
              t: 0, bx: 10, by: 2, vx: 0, vy: 0, mvx: 0, mvy: 0, phase: 0,
              trail: [], shake: 0
            };
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
  }, [isGameOver, hasWon]);

  const handleRestart = () => {
    setLives(MAX_LIVES);
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setIsGameOver(false);
    setHasWon(false);
    setMessage({ text: '', type: '' });
    setAngle(45);
    setPower(50);
    setIsFlying(false);
    setTimeLeft(20);
    setTimeWarning(false);
    
    stateRef.current = {
      t: 0, bx: 10, by: 2, vx: 0, vy: 0, mvx: 0, mvy: 0, phase: 0,
      trail: [], shake: 0
    };
  };

  const handleNextLevel = () => {
    if (onComplete) {
      onComplete({ 
        success: true, 
        win: true, 
        score: score, 
        total: 1, 
        perfect: lives === MAX_LIVES && streak > 0,
        level: level
      });
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: W, height: H } = canvas;
    const s = stateRef.current;

    ctx.save();
    if (s.shake > 0) {
      ctx.translate((Math.random()-0.5)*s.shake, (Math.random()-0.5)*s.shake);
      s.shake *= 0.9;
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d1a2e';
    ctx.fillRect(0, 0, W, H);
    
    ctx.strokeStyle = 'rgba(56, 139, 253, 0.05)';
    for(let i=0; i<W; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke(); }
    for(let i=0; i<H; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(W,i); ctx.stroke(); }

    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, H - 38, W, 38);
    ctx.fillStyle = '#238636';
    ctx.fillRect(0, H - 39, W, 2);

    // Wind visualization
    if (lvl.wind !== 0 && !isFlying) {
      ctx.fillStyle = 'rgba(79, 195, 247, 0.2)';
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(px(20 + i * 15), 50);
        ctx.lineTo(px(20 + i * 15 + (lvl.wind > 0 ? 15 : -15)), 45);
        ctx.lineTo(px(20 + i * 15 + (lvl.wind > 0 ? 15 : -15)), 55);
        ctx.fill();
      }
    }

    // Magnetic field visualization
    if (lvl.magnetOn) {
      ctx.fillStyle = 'rgba(156, 39, 176, 0.15)';
      ctx.beginPath();
      ctx.arc(px(lvl.magnetXm), py(lvl.magnetYm, H), 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9c27b0';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('🧲', px(lvl.magnetXm) - 10, py(lvl.magnetYm, H) - 10);
    }

    // Trajectory preview with wind
    if (!isFlying) {
      const rad = (angle * Math.PI) / 180;
      let vx0 = power * Math.cos(rad);
      let vy0 = power * Math.sin(rad);
      
      let tempX = 10, tempY = 2;
      ctx.beginPath();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      for (let t = 0; t < 3; t += 0.05) {
        tempX = 10 + vx0 * t + 0.5 * (lvl.wind || 0) * 10 * t * t;
        tempY = 2 + vy0 * t - 0.5 * G * t * t;
        if (tempY > -5 && tempX < 220) {
          ctx.lineTo(px(tempX), py(tempY, H));
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (s.trail.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(242, 204, 96, 0.3)';
      ctx.lineWidth = 2;
      s.trail.forEach((p, i) => {
        if (i === 0) ctx.moveTo(px(p.x), py(p.y, H));
        else ctx.lineTo(px(p.x), py(p.y, H));
      });
      ctx.stroke();
    }

    if (lvl.laserOn) {
      ctx.strokeStyle = '#f85149';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f85149';
      ctx.beginPath();
      ctx.moveTo(px(60), py(lvl.laserY, H));
      ctx.lineTo(px(200), py(lvl.laserY, H));
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    lvl.targets.forEach(tgt => {
      let xm = tgt.xm + (tgt.moving ? Math.sin(s.phase * tgt.speed + tgt.phase) * tgt.amp : 0);
      ctx.fillStyle = '#f85149';
      ctx.beginPath();
      ctx.arc(px(xm), py(tgt.ym || 0, H), tgt.r, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px(xm), py(tgt.ym || 0, H), tgt.r*0.4, 0, Math.PI*2);
      ctx.fill();
    });

    if (lvl.obstacles) {
      lvl.obstacles.forEach(obs => {
        ctx.fillStyle = '#30363d';
        ctx.fillRect(px(obs.xm - obs.w/2), py(obs.ym + obs.h/2, H), px(obs.w), -obs.h * SC);
        ctx.fillStyle = '#58a6ff';
        ctx.fillRect(px(obs.xm - obs.w/2), py(obs.ym + obs.h/2, H), px(obs.w), -2);
      });
    }

    ctx.save();
    ctx.translate(px(10), py(2, H));
    ctx.rotate((-angle * Math.PI) / 180);
    ctx.fillStyle = '#8b949e';
    ctx.fillRect(0, -8, 45, 16);
    ctx.fillStyle = '#58a6ff';
    ctx.fillRect(0, -4, 40, 8);
    ctx.restore();

    if (isFlying) {
      ctx.fillStyle = '#f2cc60';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#f2cc60';
      ctx.beginPath();
      ctx.arc(px(s.bx), py(s.by, H), 7, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px(s.bx), py(s.by, H), 3, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }, [angle, power, lvl, isFlying]);

  useEffect(() => {
    let frameId;
    const loop = () => {
      const s = stateRef.current;
      s.phase += 0.05;
      if (isFlying) {
        s.t += 0.045;
        
        // Wind effect
        const windAccel = (lvl.wind || 0) * 8;
        s.bx = 10 + s.vx * s.t + 0.5 * windAccel * s.t * s.t;
        s.by = 2 + s.vy * s.t - 0.5 * G * s.t * s.t;

        // Magnetic field effect
        if (lvl.magnetOn) {
          const dx = lvl.magnetXm - s.bx;
          const dy = lvl.magnetYm - s.by;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 60) {
            const force = lvl.magnetF * (1 - dist / 60) * 0.15;
            s.bx += dx * force;
            s.by += dy * force;
          }
        }

        s.trail.push({x: s.bx, y: s.by});
        if (s.trail.length > 20) s.trail.shift();

        const tgt = lvl.targets[0];
        let txm = tgt.xm;
        if (tgt.moving) {
          txm = tgt.xm + Math.sin(s.phase * tgt.speed + tgt.phase) * tgt.amp;
        }
        const dist = Math.sqrt((s.bx - txm)**2 + (s.by - (tgt.ym || 0))**2);

        if (dist < tgt.r / SC) {
          setIsFlying(false);
          s.shake = 15;
          const newStreak = streak + 1;
          const newMultiplier = Math.min(1 + Math.floor(newStreak / 2) * 0.25, 2.5);
          setStreak(newStreak);
          setMultiplier(newMultiplier);
          const pointsEarned = Math.floor(100 * newMultiplier);
          setScore(prev => prev + pointsEarned);
          setMessage({ text: `🎯 HIT! +${pointsEarned} points!`, type: 'ok' });
          setTimeout(() => setMessage({ text: '', type: '' }), 1500);
          setHasWon(true);
          clearInterval(timerRef.current);
        } else if (s.by < -2 || s.bx > 220 || (lvl.laserOn && s.bx > 60 && s.bx < 200 && Math.abs(s.by - lvl.laserY) < 4)) {
          setIsFlying(false);
          s.shake = 8;
          setStreak(0);
          setMultiplier(1);
          setMessage({ text: '❌ MISS! Try again', type: 'err' });
          setTimeout(() => setMessage({ text: '', type: '' }), 1500);
        }
      }
      draw();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [draw, lvl, lives, isFlying, streak]);

  const fire = () => {
    if (isFlying || lives <= 0 || hasWon) return;
    setMessage({ text: '', type: '' });
    const s = stateRef.current;
    const rad = (angle * Math.PI) / 180;
    s.vx = power * Math.cos(rad);
    s.vy = power * Math.sin(rad);
    s.bx = 10;
    s.by = 2;
    s.t = 0;
    s.mvx = 0;
    s.mvy = 0;
    s.trail = [];
    setIsFlying(true);
  };

  const renderLives = () => '▮'.repeat(lives) + '▯'.repeat(MAX_LIVES - lives);
  const timerPercent = (timeLeft / 20) * 100;

  if (hasWon) {
    const isPerfect = lives === MAX_LIVES && streak >= 1;
    return (
      <div style={styles.winScreen}>
        <div style={styles.winContent}>
          <div style={styles.winEmoji}>🏆✨🎯✨🏆</div>
          <div style={styles.winTitle}>VICTORY!</div>
          <div style={styles.winScore}>SCORE: {score}</div>
          {isPerfect && <div style={styles.perfectBadge}>💯 PERFECT!</div>}
          <div style={styles.winButtons}>
            <button onClick={handleNextLevel} style={styles.nextBtn}>NEXT LEVEL →</button>
            <button onClick={handleRestart} style={styles.restartBtn}>PLAY AGAIN</button>
          </div>
        </div>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div style={styles.gameoverScreen}>
        <div style={styles.gameoverContent}>
          <div style={styles.gameoverEmoji}>💀⚡💀</div>
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
            <span style={styles.statLabel}>SYSTEM INTEGRITY:</span>
            <span style={styles.statValue}>{renderLives()}</span>
          </div>
          <div style={styles.statGroup}>
            <span style={styles.statLabel}>⭐</span>
            <span style={styles.statValue}>{score}</span>
          </div>
          {multiplier > 1 && <div style={styles.multiplierBadge}>x{multiplier.toFixed(1)}</div>}
          <div style={{ ...styles.statGroup, ...(timeWarning && styles.timerWarning) }}>
            <span style={styles.statLabel}>⏱️</span>
            <span style={styles.statValue}>{timeLeft}s</span>
          </div>
        </div>

        <div style={styles.timerBar}>
          <div style={{ ...styles.timerFill, width: `${timerPercent}%`, background: timeLeft <= 5 ? '#f85149' : '#e94560' }} />
        </div>

        {timeWarning && <div style={styles.redFlash} />}

        <div style={styles.header}>
          <span style={styles.badge}>LEVEL {level}: {lvl.name}</span>
          <div style={styles.effects}>
            {lvl.wind !== 0 && <span className="effect-badge wind">💨 Wind {lvl.wind > 0 ? '→' : '←'}</span>}
            {lvl.magnetOn && <span className="effect-badge magnet">🧲 Magnet</span>}
            {lvl.laserOn && <span className="effect-badge laser">⚡ Laser</span>}
            {lvl.obstacles?.length > 0 && <span className="effect-badge obstacle">🧱 {lvl.obstacles.length} obstacles</span>}
            {lvl.targets[0]?.moving && <span className="effect-badge target">🎯 Moving target</span>}
          </div>
        </div>

        <canvas ref={canvasRef} width={820} height={320} style={styles.canvas} />
        
        <div style={styles.controls}>
          <div style={styles.slGroup}>
            <div style={styles.slLabel}>🎯 ANGLE</div>
            <div style={styles.slValue}>{angle}°</div>
            <input 
              type="range" 
              min="5" 
              max="85" 
              value={angle} 
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="physics-range"
              disabled={isFlying}
            />
          </div>
          <div style={styles.slGroup}>
            <div style={styles.slLabel}>💪 POWER</div>
            <div style={styles.slValue}>{power}</div>
            <input 
              type="range" 
              min="10" 
              max="140" 
              value={power} 
              onChange={(e) => setPower(parseInt(e.target.value))}
              className="physics-range"
              disabled={isFlying}
            />
          </div>
          <button onClick={fire} style={styles.fireBtn} disabled={isFlying}>🚀 FIRE</button>
        </div>
        
        {message.text && <div style={{...styles.msg, color: message.type === 'ok' ? '#5DCAA5' : '#F85149'}}>{message.text}</div>}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: { display: "flex", justifyContent: "center", alignItems: "center", width: "100%", minHeight: "100vh", padding: "20px", background: "#0a0a1a" },
  container: { background: "#0d1117", padding: "24px", borderRadius: "16px", border: "1px solid #30363d", color: "#c9d1d9", width: "860px", boxShadow: "0 0 40px rgba(0,0,0,0.4)", position: "relative" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", padding: "12px 16px", background: "#161b22", borderRadius: "8px" },
  statGroup: { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#FAC775" },
  statLabel: { color: "#888" },
  statValue: { color: "#FAC775", fontWeight: "bold" },
  multiplierBadge: { background: "#e94560", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" },
  timerWarning: { animation: "pulse 0.5s infinite", color: "#f85149" },
  timerBar: { height: "4px", background: "#30363d", borderRadius: "2px", marginBottom: "20px", overflow: "hidden" },
  timerFill: { height: "100%", transition: "width 0.3s linear" },
  redFlash: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(233,69,96,0.2)", pointerEvents: "none", zIndex: 100, animation: "flash 0.5s infinite" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", fontFamily: "monospace", flexWrap: "wrap", gap: "10px" },
  badge: { color: "#58a6ff", fontWeight: "bold" },
  effects: { display: "flex", gap: "8px", flexWrap: "wrap" },
  canvas: { width: "100%", background: "#0d1a2e", borderRadius: "8px", border: "1px solid #30363d", cursor: "pointer", position: "relative", zIndex: 0 },
  controls: { 
    display: "flex", 
    gap: "25px", 
    marginTop: "20px", 
    background: "#161b22", 
    padding: "20px", 
    borderRadius: "12px", 
    alignItems: "flex-end", 
    flexWrap: "wrap",
    position: "relative",
    zIndex: 50
  },
  slGroup: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "8px", 
    flex: 2, 
    minWidth: "200px",
    position: "relative",
    zIndex: 100
  },
  slLabel: { fontSize: "12px", color: "#8b949e", fontWeight: "bold", letterSpacing: "1px" },
  slValue: { fontSize: "28px", color: "#FAC775", fontWeight: "bold", fontFamily: "monospace" },
  fireBtn: { 
    background: "#e94560", 
    color: "white", 
    border: "none", 
    padding: "14px 36px", 
    borderRadius: "40px", 
    cursor: "pointer", 
    fontWeight: "bold", 
    fontSize: "18px", 
    transition: "transform 0.2s", 
    whiteSpace: "nowrap", 
    height: "fit-content",
    minWidth: "140px",
    boxShadow: "0 0 20px rgba(233,69,96,0.5)",
    position: "relative",
    zIndex: 20
  },
  msg: { marginTop: "15px", textAlign: "center", fontWeight: "bold", fontFamily: "monospace" },
  winScreen: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, #0a1a0f 0%, #0d1117 100%)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  winContent: { textAlign: "center", background: "rgba(0,0,0,0.8)", padding: "40px", borderRadius: "24px", border: "2px solid #FFD700", backdropFilter: "blur(10px)", maxWidth: "500px" },
  winEmoji: { fontSize: "64px", marginBottom: "16px" },
  winTitle: { fontSize: "36px", fontWeight: "800", color: "#FFD700", marginBottom: "16px" },
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
      opacity: 1 !important;
      width: 100% !important;
      height: 25px !important;
      -webkit-appearance: none;
      appearance: none;
      background: transparent !important;
      cursor: pointer;
    }
    .physics-range::-webkit-slider-runnable-track {
      height: 10px;
      background: linear-gradient(90deg, #e94560, #FAC775);
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
      border: 3px solid #e94560;
      box-shadow: 0 0 12px rgba(233,69,96,0.7);
    }
    
    .effect-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
    }
    .effect-badge.wind { background: rgba(79, 195, 247, 0.2); color: #4fc3f7; }
    .effect-badge.magnet { background: rgba(156, 39, 176, 0.2); color: #ce93d8; }
    .effect-badge.laser { background: rgba(248, 81, 73, 0.2); color: #f85149; }
    .effect-badge.obstacle { background: rgba(255, 255, 255, 0.1); color: #8b949e; }
    .effect-badge.target { background: rgba(248, 81, 73, 0.2); color: #f85149; }
  `;
  document.head.appendChild(style);
}