import { useState, useRef, useEffect, useCallback } from 'react';
import GameResult from '../components/GameResult';

const G = 9.8;
const MAX_LIVES = 3;
const SC = 820 / 220; 

const LEVELS = [
  { id: 1, name: "Static Target", wind: 0, targets: [{ xm: 150, ym: 0, r: 16, moving: false }], obstacles: [], laserOn: false, magnetOn: false },
  { id: 2, name: "Moving Target", wind: 0, targets: [{ xm: 150, ym: 0, r: 16, moving: true, speed: 0.4, phase: 0, amp: 22 }], obstacles: [], laserOn: false, magnetOn: false },
  { id: 3, name: "Wind + Barrier", wind: 0.4, targets: [{ xm: 165, ym: 0, r: 16, moving: false }], obstacles: [{ xm: 110, ym: 0, w: 3, h: 55 }], laserOn: false, magnetOn: false },
  { id: 4, name: "Laser Zone", wind: 0.2, targets: [{ xm: 160, ym: 0, r: 16, moving: true, speed: 0.25, phase: 0, amp: 15 }], obstacles: [], laserOn: true, laserY: 55, magnetOn: false },
  { id: 5, name: "Magnetic Chaos", wind: -0.3, targets: [{ xm: 155, ym: 0, r: 16, moving: true, speed: 0.5, phase: 1, amp: 18 }], obstacles: [{ xm: 90, ym: 0, w: 3, h: 40 }], laserOn: true, laserY: 70, magnetOn: true, magnetXm: 130, magnetYm: 85, magnetF: 12 }
];

const px = (xm) => xm * SC;
const py = (ym, h) => h - 38 - ym * SC;

export default function PhysicsGame({ level, onComplete }) {
  const lvlIdx = (parseInt(level) || 1) - 1;
  const lvl = LEVELS[lvlIdx] || LEVELS[0];

  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  
  const canvasRef = useRef(null);
  const stateRef = useRef({
    t: 0, bx: 10, by: 2, vx: 0, vy: 0, mvx: 0, mvy: 0, phase: 0,
    trail: [], shake: 0
  });

  const handleRestart = () => {
    // Сброс всех состояний
    setLives(MAX_LIVES);
    setScore(0);
    setIsGameOver(false);
    setHasWon(false);
    setMessage({ text: '', type: '' });
    setAngle(45);
    setPower(50);
    setIsFlying(false);
    
    // Сброс рефа
    stateRef.current = {
      t: 0, bx: 10, by: 2, vx: 0, vy: 0, mvx: 0, mvy: 0, phase: 0,
      trail: [], shake: 0
    };
  };

  const handleNextLevel = () => {
    // Сообщаем родителю, что уровень пройден
    if (onComplete) {
      onComplete(true);
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
    ctx.fillStyle = '#0d1a2e'; ctx.fillRect(0, 0, W, H);
    
    // Grid
    ctx.strokeStyle = 'rgba(56, 139, 253, 0.05)';
    for(let i=0; i<W; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke(); }
    for(let i=0; i<H; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(W,i); ctx.stroke(); }

    // Ground
    ctx.fillStyle = '#161b22'; ctx.fillRect(0, H - 38, W, 38);
    ctx.fillStyle = '#238636'; ctx.fillRect(0, H - 39, W, 2);

    // Trajectory Preview
    if (!isFlying) {
      const rad = (angle * Math.PI) / 180;
      const vx0 = power * Math.cos(rad) + lvl.wind * 10;
      const vy0 = power * Math.sin(rad);
      ctx.beginPath(); ctx.setLineDash([4, 6]); ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      for (let t = 0; t < 2; t += 0.1) {
        ctx.lineTo(px(10 + vx0 * t), py(2 + vy0 * t - 0.5 * G * t * t, H));
      }
      ctx.stroke(); ctx.setLineDash([]);
    }

    // Projectile Trail
    if (s.trail.length > 1) {
      ctx.beginPath(); ctx.strokeStyle = 'rgba(242, 204, 96, 0.3)'; ctx.lineWidth = 2;
      s.trail.forEach((p, i) => {
        if (i === 0) ctx.moveTo(px(p.x), py(p.y, H));
        else ctx.lineTo(px(p.x), py(p.y, H));
      });
      ctx.stroke();
    }

    // Targets & Obstacles
    if (lvl.laserOn) {
      ctx.strokeStyle = '#f85149'; ctx.shadowBlur = 10; ctx.shadowColor = '#f85149';
      ctx.beginPath(); ctx.moveTo(px(60), py(lvl.laserY, H)); ctx.lineTo(px(200), py(lvl.laserY, H)); ctx.stroke();
      ctx.shadowBlur = 0;
    }

    lvl.targets.forEach(tgt => {
      let xm = tgt.xm + (tgt.moving ? Math.sin(s.phase * tgt.speed + tgt.phase) * tgt.amp : 0);
      ctx.fillStyle = '#f85149'; ctx.beginPath(); ctx.arc(px(xm), py(tgt.ym || 0, H), tgt.r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px(xm), py(tgt.ym || 0, H), tgt.r*0.4, 0, Math.PI*2); ctx.fill();
    });

    // Cannon
    ctx.save(); ctx.translate(px(10), py(2, H)); ctx.rotate((-angle * Math.PI) / 180);
    ctx.fillStyle = '#8b949e'; ctx.fillRect(0, -6, 40, 12); ctx.restore();

    // Missile
    if (isFlying) {
      ctx.fillStyle = '#f2cc60'; ctx.shadowBlur = 15; ctx.shadowColor = '#f2cc60';
      ctx.beginPath(); ctx.arc(px(s.bx), py(s.by, H), 6, 0, Math.PI*2); ctx.fill();
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
        s.bx = 10 + s.vx * s.t;
        s.by = 2 + s.vy * s.t - 0.5 * G * s.t * s.t;

        if (lvl.magnetOn) {
            const dx = lvl.magnetXm - s.bx, dy = lvl.magnetYm - s.by;
            const d2 = dx*dx + dy*dy + 1;
            s.mvx += (dx / d2) * lvl.magnetF * 0.04;
            s.mvy += (dy / d2) * lvl.magnetF * 0.04;
            s.bx += s.mvx; s.by += s.mvy;
        }

        s.trail.push({x: s.bx, y: s.by});
        if (s.trail.length > 20) s.trail.shift();

        const tgt = lvl.targets[0];
        const txm = tgt.xm + (tgt.moving ? Math.sin(s.phase * tgt.speed + tgt.phase) * tgt.amp : 0);
        const dist = Math.sqrt((s.bx - txm)**2 + (s.by - (tgt.ym || 0))**2);

        if (dist < tgt.r / SC) {
          setIsFlying(false); 
          s.shake = 15;
          setScore(prev => prev + 100);
          setMessage({ text: 'CRITICAL HIT! 🎯', type: 'ok' });
          setHasWon(true);
        } else if (s.by < -2 || s.bx > 220 || (lvl.laserOn && s.bx > 60 && s.bx < 200 && Math.abs(s.by - lvl.laserY) < 2)) {
          setIsFlying(false); 
          s.shake = 8;
          if (lives <= 1) {
            setIsGameOver(true);
          } else {
            setLives(l => l - 1);
            setMessage({ text: 'CALCULATION ERROR ❌', type: 'err' });
          }
        }
      }
      draw();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [draw, lvl, lives, isFlying]);

  const fire = () => {
    if (isFlying || lives <= 0 || hasWon) return;
    setMessage({ text: '', type: '' });
    const s = stateRef.current;
    const rad = (angle * Math.PI) / 180;
    s.vx = power * Math.cos(rad) + lvl.wind * 10; 
    s.vy = power * Math.sin(rad);
    s.bx = 10; 
    s.by = 2; 
    s.t = 0; 
    s.mvx = 0; 
    s.mvy = 0; 
    s.trail = [];
    setIsFlying(true);
  };

  // Экран победы - вызываем onComplete(true) для перехода на следующий уровень
  if (hasWon) {
    return (
      <div style={styles.winScreen}>
        <div style={styles.winContent}>
          <div style={styles.winEmoji}>🏆✨🎯✨🏆</div>
          <div style={styles.winTitle}>MISSION ACCOMPLISHED</div>
          <div style={styles.winScore}>FINAL SCORE: {score} EU</div>
          <div style={styles.winStatus}>STATUS: PASSED</div>
          <div style={styles.winMessage}>
            Experimental data successfully synchronized.<br />
            The module requirements have been met.
          </div>
          <div style={styles.winButtons}>
            <button onClick={handleNextLevel} style={styles.nextBtn}>
              NEXT MODULE →
            </button>
            <button onClick={handleRestart} style={styles.restartBtn}>
              EXIT TO TERMINAL
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Экран поражения
  if (isGameOver) {
    return (
      <div style={styles.gameoverScreen}>
        <div style={styles.gameoverContent}>
          <div style={styles.gameoverEmoji}>💀⚡💀</div>
          <div style={styles.gameoverTitle}>SYSTEM FAILURE</div>
          <div style={styles.gameoverScore}>FINAL SCORE: {score} EU</div>
          <div style={styles.gameoverMessage}>
            Mission parameters not met.<br />
            Terminating operation.
          </div>
          <button onClick={handleRestart} style={styles.restartBtn}>
            RESTART MISSION
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
            <span style={styles.badge}>LEVEL {level}: {lvl.name}</span>
            <div style={styles.lives}>SYSTEM INTEGRITY: {Array(lives).fill('▮').join('')}{Array(MAX_LIVES-lives).fill('▯').join('')}</div>
        </div>
        <canvas ref={canvasRef} width={820} height={320} style={styles.canvas} />
        <div style={styles.controls}>
          <div style={styles.slGroup}>
            <div style={styles.slLabel}>LAUNCH ANGLE: {angle}°</div>
            <input type="range" min="5" max="85" value={angle} onChange={e => setAngle(+e.target.value)} style={styles.range} />
          </div>
          <div style={styles.slGroup}>
            <div style={styles.slLabel}>INITIAL VELOCITY: {power}</div>
            <input type="range" min="10" max="140" value={power} onChange={e => setPower(+e.target.value)} style={styles.range} />
          </div>
          <button onClick={fire} style={styles.fireBtn} disabled={isFlying}>INITIATE LAUNCH</button>
        </div>
        {message.text && <div style={{...styles.msg, color: message.type === 'ok' ? '#5DCAA5' : '#F85149'}}>{message.text}</div>}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: { display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100vh" },
  container: { background: "#0d1117", padding: "24px", borderRadius: "16px", border: "1px solid #30363d", color: "#c9d1d9", width: "860px", boxShadow: "0 0 40px rgba(0,0,0,0.4)" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "16px", fontFamily: "monospace" },
  badge: { color: "#58a6ff", fontWeight: "bold" },
  lives: { color: "#f85149" },
  canvas: { width: "100%", background: "#0d1a2e", borderRadius: "8px", border: "1px solid #30363d" },
  controls: { display: "flex", gap: "20px", marginTop: "20px", background: "rgba(255,255,255,0.03)", padding: "15px", borderRadius: "8px" },
  slGroup: { display: "flex", flexDirection: "column", flex: 1, gap: "5px" },
  slLabel: { fontSize: "11px", color: "#8b949e", fontWeight: "bold" },
  range: { accentColor: "#238636" },
  fireBtn: { background: "#238636", color: "white", border: "none", padding: "0 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" },
  msg: { marginTop: "15px", textAlign: "center", fontWeight: "bold", fontFamily: "monospace" },
  
  // Стили для экрана победы
  winScreen: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #0a1a0f 0%, #0d1117 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  winContent: {
    textAlign: "center",
    background: "rgba(0,0,0,0.7)",
    padding: "40px",
    borderRadius: "24px",
    border: "1px solid #FFD700",
    backdropFilter: "blur(10px)",
    maxWidth: "500px",
  },
  winEmoji: { fontSize: "64px", marginBottom: "16px" },
  winTitle: { fontSize: "36px", fontWeight: "800", color: "#FFD700", marginBottom: "16px" },
  winScore: { fontSize: "24px", fontWeight: "600", color: "#5DCAA5", marginBottom: "8px" },
  winStatus: { fontSize: "18px", color: "#fff", marginBottom: "16px" },
  winMessage: { fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "24px", lineHeight: "1.5" },
  winButtons: { display: "flex", gap: "16px", justifyContent: "center" },
  nextBtn: { background: "linear-gradient(135deg, #1D9E75, #157a58)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
  restartBtn: { background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "12px 24px", borderRadius: "8px", fontSize: "16px", cursor: "pointer" },
  
  // Стили для экрана поражения
  gameoverScreen: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #1a0a0a 0%, #0d1117 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  gameoverContent: {
    textAlign: "center",
    background: "rgba(0,0,0,0.7)",
    padding: "40px",
    borderRadius: "24px",
    border: "1px solid #D85A30",
    backdropFilter: "blur(10px)",
    maxWidth: "500px",
  },
  gameoverEmoji: { fontSize: "64px", marginBottom: "16px" },
  gameoverTitle: { fontSize: "36px", fontWeight: "800", color: "#D85A30", marginBottom: "16px" },
  gameoverScore: { fontSize: "24px", fontWeight: "600", color: "#5DCAA5", marginBottom: "16px" },
  gameoverMessage: { fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "24px", lineHeight: "1.5" },
};