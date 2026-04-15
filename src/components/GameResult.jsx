import React from 'react';

export default function GameResult({ status, score, onRestart, subjectName }) {
  const isWin = status === 'win';
  
  return (
    <div style={styles.overlay}>
      {/* Фейерверки для победителей */}
      {isWin && <div className="pyro"><div className="before"></div><div className="after"></div></div>}
      
      <div style={{
        ...styles.card,
        borderColor: isWin ? '#238636' : '#f85149',
        boxShadow: isWin ? '0 0 50px rgba(35, 134, 54, 0.2)' : '0 0 50px rgba(248, 81, 73, 0.2)'
      }}>
        <div style={styles.statusBadge}>
          {isWin ? 'STATION SCAN COMPLETE' : 'SYSTEM CRITICAL FAILURE'}
        </div>
        
        <h2 style={{...styles.title, color: isWin ? '#4caf50' : '#f85149'}}>
          {isWin ? 'MISSION SUCCESS' : 'EXPERIMENT FAILED'}
        </h2>
        
        <div style={styles.statsContainer}>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>SUBJECT</span>
            <span style={styles.statValue}>{subjectName.toUpperCase()}</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>ENERGY UNITS</span>
            <span style={styles.statValue}>{score} EU</span>
          </div>
        </div>

        <p style={styles.description}>
          {isWin 
            ? "Trajectory analysis confirmed. Physical data has been successfully synchronized with the main core."
            : "Structural integrity compromised. Multiple calculation errors detected during the ballistic phase."
          }
        </p>

        <div style={styles.btnContainer}>
          <button onClick={onRestart} style={{...styles.btn, background: isWin ? '#238636' : '#f85149'}}>
            {isWin ? 'PROCEED TO NEXT TEST' : 'RETRY SIMULATION'}
          </button>
          <button onClick={() => window.location.href = '/'} style={styles.btnSecondary}>
            RETURN TO TERMINAL
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(10, 11, 16, 0.98)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, overflow: "hidden" },
  card: { width: "450px", background: "#0d1117", border: "1px solid", padding: "40px", textAlign: "center", position: "relative" },
  statusBadge: { fontSize: "10px", fontWeight: "bold", color: "#8b949e", letterSpacing: "2px", marginBottom: "15px" },
  title: { fontSize: "28px", fontWeight: "900", marginBottom: "30px", letterSpacing: "-0.5px" },
  statsContainer: { display: "flex", gap: "2px", background: "#30363d", marginBottom: "30px", border: "1px solid #30363d" },
  statBox: { flex: 1, background: "#0d1117", padding: "15px 10px", display: "flex", flexDirection: "column", gap: "5px" },
  statLabel: { fontSize: "10px", color: "#8b949e", fontWeight: "bold" },
  statValue: { fontSize: "16px", fontWeight: "bold", color: "#fff" },
  description: { fontSize: "14px", color: "#8b949e", lineHeight: "1.6", marginBottom: "40px" },
  btnContainer: { display: "flex", flexDirection: "column", gap: "10px" },
  btn: { border: "none", color: "white", padding: "14px", fontWeight: "bold", cursor: "pointer", fontSize: "13px", letterSpacing: "1px" },
  btnSecondary: { background: "transparent", border: "1px solid #30363d", color: "#8b949e", padding: "12px", cursor: "pointer", fontSize: "12px" }
};