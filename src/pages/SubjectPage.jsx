import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/useApp";
import { translations } from "../i18n/translations";

export default function SubjectPage() {
  const { subject } = useParams();
  const nav = useNavigate();
  const context = useApp();
  
  if (!context) {
    return <div className="page">Loading...</div>;
  }

  const { progress, lang = 'en' } = context;
  const langTranslations = translations[lang] || translations.en || {};
  const t = { back: 'Back', selectLevel: 'Select Level', ...langTranslations };

  const levels = Array.from({ length: 5 }, (_, i) => i + 1);
  const completed = progress[subject] || 0;

  const colors = { physics: "var(--physics)", chemistry: "var(--chemistry)", math: "var(--math)" };
  const accentColor = colors[subject];

  return (
    <div className="page animate-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <button className="btn btn-ghost" onClick={() => nav("/")}>← {t.back}</button>
        <span className={`badge badge-${subject}`}>{t[subject]}</span>
        <div></div>
      </div>

      {/* Levels */}
      <div style={{ marginBottom: "16px" }}>
        <p className="section-label">{t.selectLevel}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {levels.map(level => {
          const isLocked = level > completed + 1;
          const isCompleted = level <= completed;
          return (
            <div
              key={level}
              className={`level-card ${isLocked ? "locked" : ""} ${isCompleted ? "completed" : ""}`}
              onClick={() => !isLocked && nav(`/game/${subject}/${level}`)}
              style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    className="level-icon"
                    style={{
                      background: isCompleted ? accentColor : isLocked ? "var(--bg3)" : "var(--bg2)",
                      color: isCompleted ? "white" : isLocked ? "var(--text3)" : "var(--text)",
                    }}
                  >
                    {isCompleted ? "✓" : level}
                  </div>
                  <div>
                    <div className="level-title">{t.level} {level}</div>
                    <div className="level-sub">
                      {isCompleted ? t.completed : isLocked ? t.locked : t.available}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {isCompleted && <span className="level-score">+150 {t.points}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}