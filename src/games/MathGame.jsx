import { useState } from "react";
import { translations } from "../i18n/translations";

const equations = [
  { eq: "2x + 3 = 7", answer: 2 },
  { eq: "x^2 = 16", answer: 4 },
  { eq: "3x - 5 = 10", answer: 5 },
];

export default function MathGame({ level, lang, onComplete }) {
  const t = translations[lang];
  const [current, setCurrent] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");

  const check = () => {
    if (+userAnswer === equations[current].answer) {
      setScore(s => s + 30);
      setFeedback(t.correct);
      if (current + 1 < equations.length) {
        setCurrent(c => c + 1);
        setUserAnswer("");
      } else {
        onComplete(score + 30);
      }
    } else {
      setFeedback(t.incorrect);
    }
  };

  return (
    <div className="page animate-in">
      <h2>{t.math} {t.level} {level}: {t.solveEquation}</h2>
      <p>{t.equation}: {equations[current].eq}</p>
      <input
        type="number"
        value={userAnswer}
        onChange={e => setUserAnswer(e.target.value)}
        placeholder={t.yourAnswer}
      />
      <button onClick={check}>{t.check}</button>
      <p>{feedback}</p>
      <p>{t.score}: {score}</p>
    </div>
  );
}