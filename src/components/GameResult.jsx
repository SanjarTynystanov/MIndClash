import React from 'react';

export default function GameResult({ status, score, subject, onRestart, onNext }) {
  const isWin = status === 'win';
  
  // Цвета в зависимости от предмета (для акцентов)
  const subjectColors = {
    physics: '#58a6ff',
    chemistry: '#4caf50',
    math: '#e94560'
  };

  const activeColor = isWin ? (subjectColors[subject] || '#238636') : '#f85149';

  return (
    <div style={styles.overlay}>
      {/* Эффект фейерверка только при победе */}
      {isWin && <div className="pyro"><div className="before"></div><div className="after"></div></div>}
      
      <div style={{
        ...styles.card,
        borderColor: activeColor,
        boxShadow: `0 0 40px ${activeColor}33` // 33 — это прозрачность
      }}>
        <div style={styles.header}>
          <span style={styles.subjectBadge}>{subject?.toUpperCase()} UNIT</span>
          <span style={{...styles.statusDot, background: activeColor}}></span>
        </div>

        <h2 style={{...styles.title, color: activeColor}}>
          {isWin ? 'MISSION ACCOMPLISHED' : 'SYSTEM FAILURE'}
        </h2>

        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>FINAL SCORE</div>
            <div style={styles.statValue}>{score} <span style={styles.unit}>EU</span></div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>STATUS</div>
            <div style={{...styles.statValue, color: isWin ? '#4caf50' : '#f85149'}}>
              {isWin ? 'PASSED' : 'FAILED'}
            </div>
          </div>
        </div>

        <p style={styles.description}>
          {isWin 
            ? "Experimental data successfully synchronized. The module requirements have been met."
            : "Critical errors detected in the simulation. Integrity levels dropped below safety threshold."
          }
        </p>

        <div style={styles.actions}>
          {isWin ? (
            <button onClick={onNext} style={{...styles.mainBtn, background: activeColor}}>
              NEXT MODULE →
            </button>
          ) : (
            <button onClick={onRestart} style={{...styles.mainBtn, background: '#f85149'}}>
              RETRY SIMULATION ↻
            </button>
          )}
          <button onClick={() => window.location.href = '/'} style={styles.secondaryBtn}>
            EXIT TO TERMINAL
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(10, 11, 16, 0.95)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 },
  card: { width: "400px", background: "#0d1117", border: "1px solid", padding: "30px", borderRadius: "4px", position: "relative", textAlign: "left" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  subjectBadge: { fontSize: "10px", fontWeight: "bold", color: "#8b949e", letterSpacing: "1.5px" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%", boxShadow: "0 0 10px currentColor" },
  title: { fontSize: "24px", fontWeight: "800", marginBottom: "25px", letterSpacing: "-0.5px" },
  statsRow: { display: "flex", gap: "1px", background: "#30363d", marginBottom: "25px", border: "1px solid #30363d" },
  statItem: { flex: 1, background: "#0d1117", padding: "15px" },
  statLabel: { fontSize: "9px", color: "#8b949e", fontWeight: "bold", marginBottom: "5px" },
  statValue: { fontSize: "18px", fontWeight: "bold", color: "#fff" },
  unit: { fontSize: "12px", color: "#8b949e" },
  description: { fontSize: "13px", color: "#8b949e", lineHeight: "1.5", marginBottom: "30px" },
  actions: { display: "flex", flexDirection: "column", gap: "10px" },
  mainBtn: { border: "none", color: "white", padding: "14px", fontWeight: "bold", cursor: "pointer", fontSize: "12px", letterSpacing: "1px", borderRadius: "4px" },
  secondaryBtn: { background: "transparent", border: "1px solid #30363d", color: "#8b949e", padding: "12px", cursor: "pointer", fontSize: "11px", borderRadius: "4px" }
};