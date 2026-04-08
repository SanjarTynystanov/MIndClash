import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/useApp";
import { translations } from "../i18n/translations";
import PhysicsGame from "../games/PhysicsGame";
import ChemistryGame from "../games/ChemistryGame";
import MathGame from "../games/MathGame";

export default function GamePage() {
  const { subject, level } = useParams();
  const nav = useNavigate();
  const [done, setDone] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const context = useApp();
  
  if (!context) {
    return <div className="page">Loading...</div>;
  }

  const { lang = 'en', completeLevel } = context;
  const langTranslations = translations[lang] || translations.en || {};
  const t = { levelComplete: 'Level Complete!', earnedPoints: 'Points Earned', level: 'Level', ...langTranslations };

  const handleComplete = (score) => {
    setFinalScore(score);
    setDone(true);
    completeLevel(subject, parseInt(level), score);
  };

  if (done) {
    return (
      <div className="page animate-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
        <h2 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "8px" }}>{t.levelComplete}</h2>
        <p style={{ color: "var(--text2)", marginBottom: "28px" }}>{t.level} {level} · {subject}</p>
        <div className="card" style={{ width: "100%", maxWidth: "280px", textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "6px" }}>{t.earnedPoints}</div>
          <div style={{ fontSize: "42px", fontWeight: "700" }}>+{finalScore}</div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-ghost" onClick={() => nav(`/subject/${subject}`)}>← {t.levels}</button>
          <button className="btn btn-primary" onClick={() => nav("/")}>{t.home}</button>
        </div>
      </div>
    );
  }

  const renderGame = () => {
    switch (subject) {
      case "physics":
        return <PhysicsGame subject={subject} level={level} lang={lang} onComplete={handleComplete} />;
      case "chemistry":
        return <ChemistryGame subject={subject} level={level} lang={lang} onComplete={handleComplete} />;
      case "math":
        return <MathGame subject={subject} level={level} lang={lang} onComplete={handleComplete} />;
      default:
        return <p>{t.noGame}</p>;
    }
  };

  return renderGame();
}