import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/useApp";
import { translations } from "../i18n/translations";
import { questions } from "../data/questions";

const LETTERS = ["A", "B", "C", "D"];
const POINTS_PER_CORRECT = 50;

export default function QuizPage() {
  const { subject, level } = useParams();
  const nav = useNavigate();
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const context = useApp();
  
  if (!context) {
    return <div className="page">Loading...</div>;
  }

  const { lang = 'en', completeLevel } = context;
  const langTranslations = translations[lang] || translations.en || {};
  const t = { question: 'Question', of: 'of', correct: 'Correct!', wrong: 'Wrong', next: 'Next', finish: 'Finish', ...langTranslations };

  const levelNum = parseInt(level);
  const levelQs = questions[subject]?.filter(q => q.level === levelNum) || [];

  const q = levelQs[idx];
  const total = levelQs.length;

  const colors = { physics: "var(--physics)", chemistry: "var(--chemistry)", math: "var(--math)" };
  const accentColor = colors[subject];

  function pick(i) {
    if (chosen !== null) return;
    setChosen(i);
    if (i === q.answer) setScore(s => s + POINTS_PER_CORRECT);
  }

  async function next() {
    if (idx + 1 >= total) {
      console.log("Completing level with score:", score);
      await completeLevel(subject, levelNum, score + (chosen === q?.answer ? 0 : 0));
      setDone(true);
    } else {
      setIdx(i => i + 1);
      setChosen(null);
    }
  }

  if (!q && !done) return <div className="page"><p style={{ color: "var(--text2)" }}>No questions found.</p></div>;

  if (done) {
    const earned = score;
    return (
      <div className="page animate-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
        <h2 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "8px" }}>{t.levelComplete}</h2>
        <p style={{ color: "var(--text2)", marginBottom: "28px" }}>{t.level} {level} · {subject}</p>

        <div className="card" style={{ width: "100%", maxWidth: "280px", textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "6px" }}>{t.earnedPoints}</div>
          <div style={{ fontSize: "42px", fontWeight: "700", color: accentColor }}>+{earned}</div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-ghost" onClick={() => nav(`/subject/${subject}`)}>
            ← {t.levels}
          </button>
          <button className="btn btn-primary" onClick={() => nav("/")}>
            {lang === "ru" ? "На главную" : "Home"}
          </button>
        </div>
      </div>
    );
  }

  const qData = q[lang] || q.ru;

  return (
    <div className="page animate-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => nav(`/subject/${subject}`)}>← {t.back}</button>
        <span className={`badge badge-${subject}`}>{t[subject]} · {t.level} {level}</span>
        <span style={{ fontSize: "13px", color: "var(--text2)", fontFamily: "'DM Mono', monospace" }}>
          {idx + 1}/{total}
        </span>
      </div>

      {/* Progress */}
      <div className="progress-bar" style={{ marginBottom: "28px" }}>
        <div className={`progress-fill fill-${subject}`} style={{ width: `${((idx + (chosen !== null ? 1 : 0)) / total) * 100}%` }} />
      </div>

      {/* Score */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <div className="score-chip" style={{ fontSize: "12px" }}>★ {score}</div>
      </div>

      {/* Question */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "11px", color: "var(--text2)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600" }}>
          {t.question} {idx + 1} {t.of} {total}
        </p>
        <p style={{ fontSize: "18px", fontWeight: "600", lineHeight: "1.5" }}>{qData.q}</p>
      </div>

      {/* Options */}
      <div style={{ marginBottom: "20px" }}>
        {qData.opts.map((opt, i) => {
          let cls = "option-btn";
          if (chosen !== null) {
            if (i === q.answer) cls += " correct";
            else if (i === chosen) cls += " wrong";
          }
          return (
            <button key={i} className={cls} onClick={() => pick(i)} disabled={chosen !== null}>
              <span className="option-letter">{LETTERS[i]}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {chosen !== null && (
        <div className="animate-in" style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{
            fontSize: "15px", fontWeight: "600",
            color: chosen === q.answer ? "var(--chemistry)" : "#ff6b6b"
          }}>
            {chosen === q.answer ? `✓ ${t.correct} +${POINTS_PER_CORRECT}` : `✗ ${t.wrong}`}
          </p>
        </div>
      )}

      {/* Next button */}
      {chosen !== null && (
        <button className="btn btn-primary animate-pop" style={{ width: "100%", padding: "13px" }} onClick={next}>
          {idx + 1 >= total ? t.finish : t.next} →
        </button>
      )}
    </div>
  );
}