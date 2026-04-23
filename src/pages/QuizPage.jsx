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
  const { completeLevelWithXP } = useContext(AppContext);
  
  const [gameCompleted, setGameCompleted] = useState(false);
  
  const currentLevel = parseInt(level) || 1;
  
  // Проверяем, существует ли предмет
  const subjectExists = questions[subject];
  
  console.log("QuizPage render:", { subject, level, currentLevel, subjectExists });
  
  const handleGameComplete = async (success, isPerfect = false) => {
    console.log("handleGameComplete вызван:", { success, currentLevel, subject });
    
    if (success) {
      setGameCompleted(true);
      
      const result = await completeLevelWithXP(
        subject, 
        currentLevel, 
        50, 
        isPerfect, 
        true
      );
      
      console.log("XP result:", result);
      
      setTimeout(() => {
        if (currentLevel < 10) {
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
      await completeLevelWithXP(subject, currentLevel, 0, false, false);
      setTimeout(() => {
        navigate(`/subject/${subject}`);
      }, 1500);
    }
  };
  
  if (!subjectExists) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={{color: 'white'}}>Subject not found!</h2>
          <button onClick={() => navigate('/')} style={styles.button}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  if (gameCompleted) {
    return (
      <div style={styles.container}>
        <div style={styles.resultCard}>
          <h1 style={styles.winTitle}>🎉 Mission Accomplished!</h1>
          <p style={styles.winText}>+50 points earned!</p>
          <button onClick={() => navigate(`/subject/${subject}`)} style={styles.button}>
            Continue →
          </button>
        </div>
      </div>
    );
  }
  
  const renderGame = () => {
    switch(subject) {
      case 'physics':
        return <PhysicsGame 
          key={`phys-${level}`}
          level={currentLevel} 
          onComplete={handleGameComplete} 
        />;
      case 'chemistry':
        return <ChemistryGame 
          key={`chem-${level}`}
          level={currentLevel} 
          onComplete={handleGameComplete} 
          onScoreUpdate={(points) => console.log("+", points)}
          onGameEnd={(result) => console.log("Game ended:", result)}
        />;
      case 'math':
        return <MathGame 
          key={`math-${level}`}
          level={currentLevel} 
          onComplete={handleGameComplete} 
          onGameEnd={(result) => console.log("Game ended:", result)}
        />;
      default:
        return (
          <div style={styles.defaultGame}>
            <h2>Unknown subject</h2>
            <button onClick={() => navigate('/')} style={styles.button}>
              Back to Home
            </button>
          </div>
        );
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.badge}>{subject?.toUpperCase()} - Module {level}</div>
      </div>
      {renderGame()}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0a0b10",
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
    borderRadius: "4px",
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: "1px"
  },
  button: {
    background: "#e94560",
    color: "white",
    border: "none",
    padding: "12px 30px",
    fontSize: "14px",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "20px",
    fontWeight: "bold"
  },
  card: {
    maxWidth: "500px",
    margin: "100px auto",
    background: "#0d1117",
    borderRadius: "8px",
    padding: "40px",
    textAlign: "center",
    border: "1px solid #30363d"
  },
  resultCard: {
    maxWidth: "500px",
    margin: "100px auto",
    background: "#0d1117",
    borderRadius: "8px",
    padding: "40px",
    textAlign: "center",
    border: "1px solid #e94560",
  },
  winTitle: {
    color: "#e94560",
    fontSize: "28px",
    marginBottom: "16px",
  },
  winText: {
    color: "#fff",
    fontSize: "16px",
    marginBottom: "20px",
  },
  defaultGame: {
    maxWidth: "500px",
    margin: "100px auto",
    background: "#0d1117",
    borderRadius: "8px",
    padding: "40px",
    textAlign: "center",
    border: "1px solid #30363d",
  },
};