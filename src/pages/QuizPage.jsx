import { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { questions } from "../data/questions";
import PhysicsGame from "../games/PhysicsGame";
import ChemistryGame from "../games/ChemistryGame";
import MathGame from "../games/MathGame";

export default function QuizPage() {
  const { subject, level } = useParams();
  const navigate = useNavigate();
  const { completeLevel } = useContext(AppContext);
  
  const [gameCompleted, setGameCompleted] = useState(false);
  
  const levelData = questions[subject]?.find(q => q.level === parseInt(level));
  
  const handleGameComplete = (success) => {
    if (success) {
      setGameCompleted(true);
      completeLevel(subject, parseInt(level), 50);
      
      setTimeout(() => {
        if (parseInt(level) < 5) {
          navigate(`/quiz/${subject}/${parseInt(level) + 1}`);
        } else {
          navigate(`/subject/${subject}`);
        }
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
    switch(subject) {
      case 'physics':
        return <PhysicsGame onComplete={handleGameComplete} question={levelData} />;
      case 'chemistry':
        return <ChemistryGame onComplete={handleGameComplete} question={levelData} />;
      case 'math':
        return <MathGame onComplete={handleGameComplete} question={levelData} />;
      default:
        return (
          <div style={styles.defaultGame}>
            <h2>{levelData?.ru?.q}</h2>
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
        <div style={styles.badge}>{subject.toUpperCase()} - Level {level}</div>
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