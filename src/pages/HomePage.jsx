import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import { translations } from "../i18n/translations";

const SUBJECTS = [
  { key: "physics", icon: "⚡", color: "physics" },
  { key: "chemistry", icon: "🧪", color: "chemistry" },
  { key: "math", icon: "∑", color: "math" },
];

export default function HomePage() {
  const { progress, totalScore, user, lang, leaderboard } = useApp();
  const t = translations[lang];
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState("subjects");

  return (
    <div className="page animate-in">
      {/* Score chip */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "20px", fontWeight: "700" }}>
            {user ? `${lang === "ru" ? "Привет" : "Hey"}, ${user.username}!` : "MindClash"}
          </p>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "2px" }}>{t.tagline}</p>
        </div>
        <div className="score-chip">
          ★ {totalScore} {t.points}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ margin: "0 -20px", padding: "0 20px" }}>
        {["subjects", "leaderboard", "stats"].map(tab => (
          <div key={tab} className={`tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
            {t[tab] || tab}
          </div>
        ))}
      </div>

      <div style={{ paddingTop: "24px" }}>
        {activeTab === "subjects" && <SubjectsTab progress={progress} t={t} nav={nav} />}
        {activeTab === "leaderboard" && <LeaderboardTab t={t} user={user} totalScore={totalScore} leaderboard={leaderboard} />}
        {activeTab === "stats" && <StatsTab progress={progress} totalScore={totalScore} t={t} lang={lang} />}
      </div>
    </div>
  );
}

function SubjectsTab({ progress, t, nav }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <p className="section-label">{t.selectLevel}</p>
      {SUBJECTS.map(({ key, icon, color }) => {
        const done = progress[key] || 0;
        const pct = (done / 5) * 100;
        return (
          <div key={key} className={`door-card ${color}`} onClick={() => nav(`/subject/${key}`)}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ fontSize: "28px" }}>{icon}</div>
                <div>
                  <div className="door-title">{t[key]}</div>
                  <div className="door-sub">{done}/5 {t.levels}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`badge badge-${color}`}>{done === 5 ? "✓" : done > 0 ? `${Math.round(pct)}%` : t.new}</span>
              </div>
            </div>
            <div className="progress-bar">
              <div className={`progress-fill fill-${color}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardTab({ t, user, totalScore, leaderboard }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const realEntries = leaderboard.length > 0 ? leaderboard : [
      { name: "Askar M.", score: 1240, initials: "AM" },
      { name: "Dana K.", score: 980, initials: "DK" },
      { name: "Nurlan B.", score: 870, initials: "NB" },
      { name: "Kamila R.", score: 720, initials: "KR" },
    ];
    const myEntry = user ? { name: user.username, score: totalScore, me: true } : null;
    const allEntries = myEntry ? [...realEntries, myEntry] : realEntries;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(allEntries.sort((a, b) => b.score - a.score));
  }, [user, totalScore, leaderboard]);

  const avatarColors = ["var(--physics-dim)", "var(--chemistry-dim)", "var(--math-dim)", "rgba(255,200,0,0.15)"];
  const textColors = ["var(--physics)", "var(--chemistry)", "var(--math)", "var(--gold)"];
  const rankColors = ["var(--gold)", "#c0c0c0", "#cd7f32"];

  return (
    <div className="card">
      <p className="section-label" style={{ marginBottom: "8px" }}>{t.leaderboard}</p>
      {entries.map((entry, i) => (
        <div key={i} className={`lb-row ${entry.me ? "me" : ""}`}>
          <div className="lb-rank" style={{ color: rankColors[i] || "var(--text2)" }}>
            {i + 1}
          </div>
          <div className="lb-avatar" style={{ background: avatarColors[i % 4] || "var(--bg3)", color: textColors[i % 4] || "var(--text2)" }}>
            {entry.initials || entry.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="lb-name" style={entry.me ? { fontWeight: 600 } : {}}>
            {entry.name} {entry.me && "(you)"}
          </div>
          <div className="lb-score" style={{ color: i === 0 ? "var(--gold)" : "var(--text)" }}>
            {entry.score}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsTab({ progress, totalScore, t, lang }) {
  const totalDone = Object.values(progress).reduce((a, b) => a + b, 0);
  const rank = totalScore > 700 ? 3 : totalScore > 400 ? 5 : 8;

  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: "20px" }}>
        <div className="stat-card">
          <div className="stat-val" style={{ color: "var(--gold)" }}>{totalScore}</div>
          <div className="stat-lbl">{t.totalPoints}</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{totalDone}</div>
          <div className="stat-lbl">{t.completed_levels}</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: "var(--physics)" }}>#{rank}</div>
          <div className="stat-lbl">{t.rank}</div>
        </div>
      </div>

      <p className="section-label">{lang === "ru" ? "По предметам" : "By subject"}</p>
      <div className="card" style={{ padding: "12px 16px" }}>
        {[
          { key: "physics", icon: "⚡", label: t.physics, color: "var(--physics)" },
          { key: "chemistry", icon: "🧪", label: t.chemistry, color: "var(--chemistry)" },
          { key: "math", icon: "∑", label: t.math, color: "var(--math)" },
        ].map(({ key, icon, label, color }) => (
          <div key={key} className="lb-row">
            <div style={{ fontSize: "16px", width: "24px" }}>{icon}</div>
            <div className="lb-name">{label}</div>
            <div className="lb-score" style={{ color }}>{progress[key] || 0}/5</div>
          </div>
        ))}
      </div>
    </div>
  );
}