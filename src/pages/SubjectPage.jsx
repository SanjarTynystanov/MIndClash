import { useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import "../styles/global.css"; 

export default function SubjectPage() {
  const { subject } = useParams();
  const { progress, user } = useContext(AppContext);
  
  const subjectData = {
    physics: { 
      name: "Physics", 
      icon: "⚛️", 
      color: "#873cdd",
      gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      description: "Laws of motion, energy, and ballistic trajectories"
    },
    chemistry: { 
      name: "Chemistry", 
      icon: "🧪", 
      color: "#533483",
      gradient: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
      description: "Molecular structures and chemical reactions"
    },
    math: { 
      name: "Math", 
      icon: "📐", 
      color: "#0f3460",
      gradient: "linear-gradient(135deg, #1a1a2e 0%, #1a1a2e 100%)",
      description: "Equations, logic, and numerical analysis"
    },
  };
  
  const current = subjectData[subject];
  const currentLevel = user ? (progress[subject] || 0) : 0;
  const levels = [1, 2, 3, 4, 5];
  
  return (
    <div style={styles.container}>
      <div style={{...styles.hero, background: current.gradient, borderBottom: `2px solid ${current.color}`}}>
        <div style={styles.heroIcon}>{current.icon}</div>
        <h1 style={styles.heroTitle}>{current.name}</h1>
        <p style={styles.heroDescription}>{current.description}</p>
        
        <div style={styles.progressContainer}>
          <div style={styles.progressLabel}>
            <span>TOTAL PROGRESS</span>
            <span>{currentLevel}/5 MODULES</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${(currentLevel / 5) * 100}%`, background: current.color}}></div>
          </div>
        </div>
      </div>
      
      <div style={styles.levelsGrid}>
        {levels.map((level) => {
          const isLocked = level > currentLevel + 1;
          const isCompleted = level <= currentLevel;
          const isCurrent = level === currentLevel + 1;
          
          return (
            <Link
              key={level}
              to={!isLocked ? `/quiz/${subject}/${level}` : "#"}
              className={!isLocked ? "level-card-available" : ""}
              style={{
                ...styles.levelCard,
                ...(isLocked && styles.levelCardLocked),
                ...(isCompleted && styles.levelCardCompleted),
                ...(isCurrent && styles.levelCardCurrent)
              }}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              <div style={styles.levelHeader}>
                <span style={styles.levelNumber}>MODULE {level < 10 ? `0${level}` : level}</span>
                {isCompleted && <span style={styles.checkIcon}>SCANNED</span>}
              </div>
              
              <div style={styles.levelContent}>
                {isLocked ? (
                  <span style={styles.statusTextLocked}>ACCESS DENIED</span>
                ) : isCompleted ? (
                  <span style={styles.statusTextCompleted}>STATION READY</span>
                ) : (
                  <span style={styles.statusTextCurrent}>READY FOR TEST</span>
                )}
              </div>
              
              {!isLocked && (
                <div style={{...styles.actionHint, color: isCompleted ? "#4caf50" : "#58a6ff"}}>
                  {isCompleted ? "RE-RUN SIMULATION →" : "START MISSION →"}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <Link to="/" style={styles.backButton}>BACK TO LABORATORY</Link>
    </div>
  );
}

// Стили обновлены под "Инженерный" стиль
const styles = {
  container: { minHeight: "100vh", background: "#0a0b10", paddingBottom: "60px", fontFamily: "'Inter', sans-serif" },
  hero: { padding: "60px 20px", textAlign: "center", color: "white", marginBottom: "40px" },
  heroIcon: { fontSize: "50px", marginBottom: "15px", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" },
  heroTitle: { fontSize: "42px", fontWeight: "800", letterSpacing: "-1px", marginBottom: "10px" },
  heroDescription: { fontSize: "16px", color: "#8b949e", maxWidth: "500px", margin: "0 auto 30px" },
  progressContainer: { maxWidth: "350px", margin: "0 auto" },
  progressLabel: { display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold", letterSpacing: "1px", marginBottom: "8px", color: "#8b949e" },
  progressBar: { height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" },
  progressFill: { height: "100%", borderRadius: "2px", boxShadow: "0 0 10px currentColor" },
  levelsGrid: { maxWidth: "1000px", margin: "0 auto", padding: "0 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" },
  levelCard: { background: "#111218", borderRadius: "4px", padding: "24px", textDecoration: "none", border: "1px solid #21262d", transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)", position: "relative", overflow: "hidden" },
  levelCardLocked: { opacity: 0.3, cursor: "not-allowed" },
  levelCardCompleted: { borderColor: "#238636" },
  levelCardCurrent: { borderColor: "#58a6ff", background: "rgba(56, 139, 253, 0.05)", boxShadow: "0 0 20px rgba(56, 139, 253, 0.1)" },
  levelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  levelNumber: { fontSize: "11px", fontWeight: "bold", color: "#8b949e", letterSpacing: "2px" },
  checkIcon: { fontSize: "10px", color: "#238636", fontWeight: "bold", border: "1px solid #238636", padding: "2px 6px", borderRadius: "3px" },
  levelContent: { marginBottom: "25px" },
  statusTextLocked: { fontSize: "18px", fontWeight: "700", color: "#30363d" },
  statusTextCompleted: { fontSize: "18px", fontWeight: "700", color: "#e6edf3" },
  statusTextCurrent: { fontSize: "18px", fontWeight: "700", color: "#58a6ff" },
  actionHint: { fontSize: "12px", fontWeight: "bold", letterSpacing: "0.5px" },
  backButton: { display: "block", width: "fit-content", margin: "50px auto", color: "#8b949e", fontSize: "12px", fontWeight: "bold", letterSpacing: "1px", textDecoration: "none", borderBottom: "1px solid transparent", transition: "0.3s" }
};