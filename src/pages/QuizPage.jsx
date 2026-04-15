import { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { questions } from "../data/questions";
import PhysicsGame from "../games/PhysicsGame";
import ChemistryGame from "../games/ChemistryGame";
import MathGame from "../games/MathGame";
import "../styles/global.css"; 

export default function QuizPage() {
  const { subject, level } = useParams();
  const navigate = useNavigate();
  const { completeLevel } = useContext(AppContext);
  
  const [gameCompleted, setGameCompleted] = useState(false);
  
  const currentLevel = parseInt(level) || 1;
  const levelData = questions[subject]?.find(q => q.level === currentLevel);
  
  console.log("QuizPage рендер:", { subject, level, currentLevel, gameCompleted });
  
  const handleGameComplete = (success) => {
    console.log("handleGameComplete вызван:", { success, currentLevel, subject });
    
    if (success) {
      setGameCompleted(true);
      completeLevel(subject, currentLevel, 50);
      
      setTimeout(() => {
        if (currentLevel < 5) {
          const nextLevel = currentLevel + 1;
          const nextUrl = `/quiz/${subject}/${nextLevel}`;
          console.log("Переход на следующий уровень:", nextUrl);
          navigate(nextUrl);
        } else {
          console.log("Последний уровень, переход на страницу предмета");
          navigate(`/subject/${subject}`);
        }
      }, 1500);
    } else {
      // Если игра проиграна - возвращаемся к выбору предмета
      setTimeout(() => {
        navigate(`/subject/${subject}`);
      }, 1500);
    }
  };
  
  if (!levelData) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Level not found!</h2>
          <button onClick={() => navigate(`/subject/${subject}`)} style={styles.button}>
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }
  
  if (gameCompleted) {
    return (
      <div style={styles.container}>
        <div style={styles.resultCard}>
          <h1>🎉 Level Completed!</h1>
          <p>+50 points earned!</p>
          <button onClick={() => navigate(`/subject/${subject}`)} style={styles.button}>
            Continue →
          </button>
        </div>
      </div>
    );
  }
  
  const renderGame = () => {
    console.log("Рендер игры для:", subject, "уровень:", currentLevel);
    
    switch(subject) {
      case 'physics':
        return <PhysicsGame level={level} onComplete={handleGameComplete} />
      case 'chemistry':
        return <ChemistryGame 
          onComplete={handleGameComplete} 
          level={currentLevel}
          onScoreUpdate={(points) => console.log("+", points)}
          onGameEnd={(result) => console.log("Game ended:", result)}
        />;
      case 'math':
        return <MathGame 
          onComplete={handleGameComplete} 
          level={currentLevel}
          onGameOver={() => navigate(`/subject/${subject}`)}
        />;
      default:
        return (
          <div style={styles.defaultGame}>
            <h2>{levelData?.ru?.q || levelData?.question}</h2>
            <button onClick={() => handleGameComplete(true)} style={styles.button}>
              Complete Level
            </button>
          </div>
        );
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.badge}>{subject?.toUpperCase()} - Level {level}</div>
      </div>
      {renderGame()}
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
    textAlign: "center",
    marginBottom: "30px",
  },
  badge: {
    display: "inline-block",
    padding: "8px 20px",
    background: "#e94560",
    borderRadius: "20px",
    color: "#fff",
    fontWeight: "bold",
  },
  resultCard: {
    maxWidth: "500px",
    margin: "100px auto",
    background: "#1a1a2e",
    borderRadius: "15px",
    padding: "40px",
    textAlign: "center",
    border: "1px solid #333",
  },
  button: {
    background: "#e94560",
    color: "white",
    border: "none",
    padding: "12px 30px",
    fontSize: "16px",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "20px",
  },
  card: {
    maxWidth: "500px",
    margin: "100px auto",
    background: "#1a1a2e",
    borderRadius: "15px",
    padding: "40px",
    textAlign: "center",
  },
  defaultGame: {
    background: "#1a1a2e",
    borderRadius: "15px",
    padding: "40px",
    textAlign: "center",
  },
};