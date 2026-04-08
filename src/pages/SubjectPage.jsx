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
      gradient: "linear-gradient(135deg, #690987 0%, #c73e54 100%)",
      description: "Законы движения, энергия, сила"
    },
    chemistry: { 
      name: "Chemistry", 
      icon: "🧪", 
      color: "#533483",
      gradient: "linear-gradient(135deg, #533483 0%, #3a1f5c 100%)",
      description: "Элементы, реакции, соединения"
    },
    math: { 
      name: "Math", 
      icon: "📐", 
      color: "#0f3460",
      gradient: "linear-gradient(135deg, #0f3460 0%, #0a2540 100%)",
      description: "Уравнения, логика, числа"
    },
  };
  
  const current = subjectData[subject];
  const currentLevel = user ? (progress[subject] || 0) : 0;
  const levels = [1, 2, 3, 4, 5];
  
  return (
    <div style={styles.container}>
      {/* Hero секция */}
      <div style={{...styles.hero, background: current.gradient}}>
        <div style={styles.heroIcon}>{current.icon}</div>
        <h1 style={styles.heroTitle}>{current.name}</h1>
        <p style={styles.heroDescription}>{current.description}</p>
        
        {/* Прогресс-бар */}
        <div style={styles.progressContainer}>
          <div style={styles.progressLabel}>
            <span>📊 Прогресс</span>
            <span>{currentLevel}/5 уровней</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${(currentLevel / 5) * 100}%`}}></div>
          </div>
        </div>
      </div>
      
      {/* Сетка уровней */}
      <div style={styles.levelsGrid}>
        {levels.map((level) => {
          const isLocked = level > currentLevel + 1;
          const isCompleted = level <= currentLevel;
          const isCurrent = level === currentLevel + 1 && !isCompleted;
          
          return (
            <Link
              key={level}
              to={!isLocked ? `/quiz/${subject}/${level}` : "#"}
              style={{
                ...styles.levelCard,
                ...(isLocked && styles.levelCardLocked),
                ...(isCompleted && styles.levelCardCompleted),
                ...(isCurrent && styles.levelCardCurrent),
                ...(!isLocked && !isCompleted && styles.levelCardAvailable)
              }}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              <div style={styles.levelNumber}>
                {isCompleted ? "✅" : `Уровень ${level}`}
              </div>
              
              <div style={styles.levelContent}>
                {isLocked && (
                  <div style={styles.lockIcon}>🔒</div>
                )}
                {isCompleted && (
                  <div style={styles.completedBadge}>
                    <span>Пройден</span>
                    <span style={styles.checkMark}>✓</span>
                  </div>
                )}
                {isCurrent && (
                  <div style={styles.currentBadge}>
                    <span>Текущий</span>
                    <span style={styles.playIcon}>▶</span>
                  </div>
                )}
                {!isLocked && !isCompleted && !isCurrent && (
                  <div style={styles.availableBadge}>
                    <span>Доступен</span>
                    <span style={styles.lockIcon}>🔓</span>
                  </div>
                )}
              </div>
              
              {!isLocked && (
                <button style={styles.playButton}>
                  {isCompleted ? "Повторить" : "Начать"}
                </button>
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Кнопка назад */}
      <Link to="/" style={styles.backButton}>
        ← Вернуться на главную
      </Link>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0a0a1a",
    paddingBottom: "60px",
  },
  
  // Hero секция
  hero: {
    padding: "40px 20px",
    textAlign: "center",
    color: "white",
    borderBottomLeftRadius: "30px",
    borderBottomRightRadius: "30px",
    marginBottom: "40px",
  },
  heroIcon: {
    fontSize: "64px",
    marginBottom: "10px",
  },
  heroTitle: {
    fontSize: "36px",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  heroDescription: {
    fontSize: "14px",
    opacity: 0.9,
    marginBottom: "30px",
  },
  
  // Прогресс-бар
  progressContainer: {
    maxWidth: "400px",
    margin: "0 auto",
  },
  progressLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    marginBottom: "8px",
    opacity: 0.9,
  },
  progressBar: {
    height: "8px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "white",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  
  // Сетка уровней
  levelsGrid: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "0 20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  
  // Карточки уровней
  levelCard: {
    background: "#1a1a2e",
    borderRadius: "16px",
    padding: "20px",
    textDecoration: "none",
    transition: "all 0.3s ease",
    border: "1px solid #333",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  levelCardAvailable: {
    borderColor: "#e94560",
    boxShadow: "0 0 15px rgba(233,69,96,0.2)",
  },
  levelCardLocked: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  levelCardCompleted: {
    borderColor: "#4caf50",
    background: "rgba(76,175,80,0.1)",
  },
  levelCardCurrent: {
    borderColor: "#ff9800",
    boxShadow: "0 0 20px rgba(255,152,0,0.3)",
    transform: "scale(1.02)",
  },
  
  levelNumber: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.05)",
  },
  
  levelContent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "60px",
  },
  
  lockIcon: {
    fontSize: "32px",
  },
  
  completedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#4caf50",
    padding: "8px 16px",
    borderRadius: "20px",
    color: "white",
    fontSize: "14px",
  },
  checkMark: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  
  currentBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#ff9800",
    padding: "8px 16px",
    borderRadius: "20px",
    color: "white",
    fontSize: "14px",
  },
  playIcon: {
    fontSize: "16px",
  },
  
  availableBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(233,69,96,0.2)",
    padding: "8px 16px",
    borderRadius: "20px",
    color: "#e94560",
    fontSize: "14px",
  },
  
  playButton: {
    background: "#e94560",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "10px",
  },
  
  // Кнопка назад
  backButton: {
    display: "block",
    maxWidth: "200px",
    margin: "40px auto 0",
    textAlign: "center",
    padding: "12px 24px",
    background: "transparent",
    color: "#8899aa",
    textDecoration: "none",
    borderRadius: "10px",
    border: "1px solid #333",
    transition: "all 0.3s",
  },
};

// Добавляем hover эффекты через styleSheet
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .level-card-available:hover {
    transform: translateY(-5px);
    border-color: #ff6b8a;
    box-shadow: 0 10px 25px rgba(233,69,96,0.3);
  }
  
  .level-card-available .play-button:hover {
    background: #ff6b8a;
    transform: scale(1.05);
  }
  
  .back-button:hover {
    color: #fff;
    border-color: #e94560;
  }
`;
document.head.appendChild(styleSheet);