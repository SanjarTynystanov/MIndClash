import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import '../styles/global.css';

export default function HomePage() {
  const { user, progress, totalScore, leaderboard } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("subjects"); // subjects, leaderboard

  const subjects = [
    { id: "physics", name: "Physics", icon: "⚛️", color: "#e94560" },
    { id: "chemistry", name: "Chemistry", icon: "🧪", color: "#533483" },
    { id: "math", name: "Math", icon: "📐", color: "#0f3460" },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>MindClash</h1>
        <p style={styles.subtitle}>Test your knowledge in Physics, Chemistry, and Math!</p>
      </div>

      {/* Статистика пользователя */}
      {user && (
        <div style={styles.statsCard}>
          <h3>Welcome, {user.username}! </h3>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{totalScore}</div>
              <div style={styles.statLabel}>Total Score</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{progress.physics}/5</div>
              <div style={styles.statLabel}>Physics</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{progress.chemistry}/5</div>
              <div style={styles.statLabel}>Chemistry</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{progress.math}/5</div>
              <div style={styles.statLabel}>Math</div>
            </div>
          </div>
        </div>
      )}

      {/* Табы */}
      <div style={styles.tabs}>
        <button 
          onClick={() => setActiveTab("subjects")}
          style={activeTab === "subjects" ? styles.activeTab : styles.tab}
        >
          📚 Subjects
        </button>
        <button 
          onClick={() => setActiveTab("leaderboard")}
          style={activeTab === "leaderboard" ? styles.activeTab : styles.tab}
        >
          🏆 Leaderboard
        </button>
      </div>

      {/* Subjects Tab */}
      {activeTab === "subjects" && (
        <div style={styles.subjectsGrid}>
          {subjects.map((subject) => (
            <Link to={`/subject/${subject.id}`} key={subject.id} style={styles.subjectCard}>
              <div style={{ ...styles.subjectIcon, background: subject.color }}>
                {subject.icon}
              </div>
              <h3 style={styles.subjectName}>{subject.name}</h3>
              {user && (
                <div style={styles.levelProgress}>
                  Level {progress[subject.id]} / 5
                </div>
              )}
              <button style={styles.playButton}>Play →</button>
            </Link>
          ))}
        </div>
      )}

     {/* Leaderboard Tab */}
{activeTab === "leaderboard" && (
  <div style={styles.leaderboardCard}>
    <h2 style={styles.leaderboardTitle}>🏆 Top Players</h2>
    {/* ИСПРАВЛЕНИЕ: Используем combinedLeaderboard вместо leaderboard */}
    {combinedLeaderboard.length === 0 ? (
      <p style={styles.noData}>No data yet. Complete some levels!</p>
    ) : (
      <div style={styles.leaderboardList}>
        {combinedLeaderboard.map((player, index) => (
          <div key={index} style={styles.leaderboardItem}>
            <div style={styles.rank}>
              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
            </div>
            <div style={styles.playerName}>
              {player.username}
              {/* Добавляем бейдж NPC для наглядности */}
              {player.isNPC && <span style={styles.npcBadge}>🤖 NPC</span>}
            </div>
            <div style={styles.playerScore}>{player.total_score} pts</div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
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
    marginBottom: "40px",
  },
  title: {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#e94560",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#888",
  },
  statsCard: {
    maxWidth: "800px",
    margin: "0 auto 40px",
    background: "#1a1a2e",
    borderRadius: "15px",
    padding: "25px",
    border: "1px solid #333",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  statItem: {
    textAlign: "center",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#e94560",
  },
  statLabel: {
    fontSize: "14px",
    color: "#888",
    marginTop: "5px",
  },
  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "40px",
  },
  tab: {
    padding: "12px 30px",
    fontSize: "16px",
    background: "#1a1a2e",
    color: "#888",
    border: "1px solid #333",
    borderRadius: "10px",
    cursor: "pointer",
  },
  activeTab: {
    padding: "12px 30px",
    fontSize: "16px",
    background: "#e94560",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  subjectsGrid: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
  },
  subjectCard: {
    background: "#1a1a2e",
    borderRadius: "15px",
    padding: "30px",
    textAlign: "center",
    textDecoration: "none",
    transition: "transform 0.3s",
    border: "1px solid #333",
  },
  subjectIcon: {
    width: "80px",
    height: "80px",
    margin: "0 auto 20px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
  },
  subjectName: {
    color: "#fff",
    marginBottom: "15px",
  },
  levelProgress: {
    color: "#888",
    fontSize: "14px",
    marginBottom: "20px",
  },
  playButton: {
    background: "#e94560",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  leaderboardCard: {
    maxWidth: "600px",
    margin: "0 auto",
    background: "#1a1a2e",
    borderRadius: "15px",
    padding: "25px",
    border: "1px solid #333",
  },
  leaderboardTitle: {
    textAlign: "center",
    color: "#e94560",
    marginBottom: "20px",
  },
  leaderboardList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  leaderboardItem: {
    display: "grid",
    gridTemplateColumns: "70px 1fr 100px",
    alignItems: "center",
    padding: "12px",
    background: "#0a0a1a",
    borderRadius: "8px",
  },
  rank: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  playerName: {
    color: "#fff",
    fontWeight: "bold",
  },
  playerScore: {
    color: "#e94560",
    fontWeight: "bold",
    textAlign: "right",
  },
  noData: {
    textAlign: "center",
    color: "#888",
    padding: "40px",
  },
};