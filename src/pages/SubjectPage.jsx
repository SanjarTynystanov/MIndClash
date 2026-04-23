import { useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

// Функция для безопасного получения уровня прогресса
const getProgressLevel = (progress, subject) => {
  if (!progress) return 0;
  const prog = progress[subject];
  if (typeof prog === "number") return prog;
  if (prog && prog.levelCompleted !== undefined) return prog.levelCompleted;
  return 0;
};

export default function SubjectPage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { progress} = useContext(AppContext);

  const levels = [1, 2, 3, 4, 5,6,7,8,9,10];
  const subjectName = {
    physics: "⚛️ Physics",
    chemistry: "🧪 Chemistry",
    math: "📐 Math",
  }[subject] || subject;

  const subjectColor = {
    physics: "#e94560",
    chemistry: "#533483",
    math: "#0f3460",
  }[subject] || "#e94560";

  const completedLevel = getProgressLevel(progress, subject);
  const bestScore = 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← Back
        </button>
        <h1 style={{ ...styles.title, color: subjectColor }}>{subjectName}</h1>
        <div style={styles.stats}>
          <span>📊 Progress: {completedLevel}/5</span>
          <span>🏆 Best Score: {bestScore}</span>
        </div>
      </div>

      <div style={styles.levelsGrid}>
        {levels.map((level) => {
          const isLocked = level > completedLevel + 1;
          const isCompleted = level <= completedLevel;

          return (
            <Link
              key={level}
              to={!isLocked ? `/quiz/${subject}/${level}` : "#"}
              style={{
                ...styles.levelCard,
                background: isCompleted
                  ? "rgba(29, 158, 117, 0.1)"
                  : isLocked
                  ? "rgba(255, 255, 255, 0.03)"
                  : "#1a1a2e",
                borderColor: isCompleted
                  ? "#1D9E75"
                  : isLocked
                  ? "#333"
                  : subjectColor,
                cursor: isLocked ? "not-allowed" : "pointer",
                opacity: isLocked ? 0.5 : 1,
              }}
              onClick={(e) => {
                if (isLocked) {
                  e.preventDefault();
                }
              }}
            >
              <div
                style={{
                  ...styles.levelNumber,
                  background: isCompleted ? "#1D9E75" : subjectColor,
                }}
              >
                {isCompleted ? "✓" : level}
              </div>
              <h3 style={styles.levelTitle}>
                {subject === "physics" && ["Motion", "Force", "Energy", "Waves", "Quantum"][level - 1]}
                {subject === "chemistry" && ["Molecules", "Reactions", "Acids", "Organic", "Thermo"][level - 1]}
                {subject === "math" && ["Algebra", "Geometry", "Trig", "Calculus", "Stats"][level - 1]}
              </h3>
              <p style={styles.levelDesc}>
                {subject === "physics" && [
                  "Master the basics of motion and velocity",
                  "Learn about forces and Newton's laws",
                  "Explore kinetic and potential energy",
                  "Understand wave properties",
                  "Dive into quantum mechanics",
                ][level - 1]}
                {subject === "chemistry" && [
                  "Build molecules and understand bonds",
                  "Balance chemical equations",
                  "Learn about acids and bases",
                  "Explore organic compounds",
                  "Master thermodynamics",
                ][level - 1]}
                {subject === "math" && [
                  "Solve linear equations",
                  "Master geometry and shapes",
                  "Learn trigonometric functions",
                  "Introduction to calculus",
                  "Statistics and probability",
                ][level - 1]}
              </p>
              {isCompleted && (
                <div style={styles.completedBadge}>✅ Completed</div>
              )}
              {isLocked && (
                <div style={styles.lockedBadge}>
                  🔒 Complete previous level
                </div>
              )}
              {!isCompleted && !isLocked && (
                <button style={{ ...styles.playButton, background: subjectColor }}>
                  Start → 
                </button>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0a0a1a",
    padding: "40px 20px",
  },
  header: {
    maxWidth: "800px",
    margin: "0 auto 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "15px",
  },
  backButton: {
    background: "#1a1a2e",
    color: "#fff",
    border: "1px solid #333",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: 0,
  },
  stats: {
    display: "flex",
    gap: "20px",
    color: "#888",
    fontSize: "14px",
  },
  levelsGrid: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  levelCard: {
    background: "#1a1a2e",
    border: "1px solid #333",
    borderRadius: "12px",
    padding: "20px",
    textDecoration: "none",
    transition: "transform 0.2s, border-color 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  levelNumber: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#fff",
  },
  levelTitle: {
    color: "#fff",
    margin: 0,
    fontSize: "18px",
    minWidth: "100px",
  },
  levelDesc: {
    color: "#888",
    fontSize: "13px",
    margin: 0,
    flex: 1,
  },
  completedBadge: {
    background: "#1D9E75",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
  },
  lockedBadge: {
    background: "#333",
    color: "#888",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
  },
  playButton: {
    border: "none",
    padding: "8px 20px",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
};