// import { useState } from "react";
// import { translations } from "../i18n/translations";

// const equations = [
//   { eq: "2x + 3 = 7", answer: 2 },
//   { eq: "x^2 = 16", answer: 4 },
//   { eq: "3x - 5 = 10", answer: 5 },
// ];

// export default function MathGame({ level, lang, onComplete }) {
//   const t = translations[lang];
//   const [current, setCurrent] = useState(0);
//   const [userAnswer, setUserAnswer] = useState("");
//   const [score, setScore] = useState(0);
//   const [feedback, setFeedback] = useState("");

//   const check = () => {
//     if (+userAnswer === equations[current].answer) {
//       setScore(s => s + 30);
//       setFeedback(t.correct);
//       if (current + 1 < equations.length) {
//         setCurrent(c => c + 1);
//         setUserAnswer("");
//       } else {
//         onComplete(score + 30);
//       }
//     } else {
//       setFeedback(t.incorrect);
//     }
//   };

//   return (
//     <div className="page animate-in">
//       <h2>{t.math} {t.level} {level}: {t.solveEquation}</h2>
//       <p>{t.equation}: {equations[current].eq}</p>
//       <input
//         type="number"
//         value={userAnswer}
//         onChange={e => setUserAnswer(e.target.value)}
//         placeholder={t.yourAnswer}
//       />
//       <button onClick={check}>{t.check}</button>
//       <p>{feedback}</p>
//       <p>{t.score}: {score}</p>
//     </div>
//   );
// }
import { useState } from 'react';

export default function MathGame({ onComplete, question }) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  
  const checkAnswer = () => {
    const numAnswer = parseFloat(answer);
    if (numAnswer === question.answer) {
      onComplete(true);
    } else {
      setError('❌ Wrong answer! Try again!');
      setAnswer('');
      setTimeout(() => setError(''), 1500);
    }
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📐 Math Challenge</h2>
      <p style={styles.question}>{question?.ru?.q || "Solve the equation"}</p>
      
      <div style={styles.inputContainer}>
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer"
          style={styles.input}
          onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
        />
        <button onClick={checkAnswer} style={styles.checkButton}>
          Submit Answer
        </button>
      </div>
      
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

const styles = {
  container: {
    background: "#1a1a2e",
    borderRadius: "15px",
    padding: "40px",
    textAlign: "center",
  },
  title: {
    color: "#e94560",
    marginBottom: "20px",
  },
  question: {
    color: "#fff",
    fontSize: "24px",
    marginBottom: "30px",
  },
  inputContainer: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    padding: "12px 20px",
    fontSize: "18px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#0a0a1a",
    color: "#fff",
    width: "200px",
    textAlign: "center",
  },
  checkButton: {
    background: "#e94560",
    color: "white",
    border: "none",
    padding: "12px 30px",
    fontSize: "16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  error: {
    marginTop: "20px",
    padding: "10px",
    background: "#f44336",
    color: "white",
    borderRadius: "8px",
  },
};