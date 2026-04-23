import { useContext, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import "../styles/global.css";

const NPC_PLAYERS = [
  { username: "⚡ QuantumMaster", total_score: 2450 },
  { username: "🧪 ChemWizard", total_score: 2320 },
  { username: "📐 MathGuru", total_score: 2180 },
  { username: "🔬 LabRat", total_score: 2050 },
  { username: "💡 EinsteinJr", total_score: 1950 },
  { username: "🎓 ProfessorX", total_score: 1850 },
  { username: "🧠 Brainiac", total_score: 1750 },
  { username: "⚛️ AtomSmasher", total_score: 1650 },
  { username: "🧪 Alchemist", total_score: 1550 },
  { username: "📊 StatMaster", total_score: 1450 },
];

// Функция для безопасного получения уровня прогресса
const getProgressLevel = (progress, subject) => {
  if (!progress) return 0;
  const prog = progress[subject];
  if (typeof prog === "number") return prog;
  if (prog && prog.levelCompleted !== undefined) return prog.levelCompleted;
  return 0;
};

export default function HomePage() {
  const { user, progress, totalScore, leaderboard } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("subjects");

  console.log("HomePage - progress:", progress);
  console.log("HomePage - totalScore:", totalScore);

  const subjects = [
    { id: "physics", name: "Physics", icon: "⚛️", color: "#e94560" },
    { id: "chemistry", name: "Chemistry", icon: "🧪", color: "#533483" },
    { id: "math", name: "Math", icon: "📐", color: "#0f3460" },
  ];

  const combinedLeaderboard = useMemo(() => {
    const realPlayers = (leaderboard || []).map(p => ({ ...p, isNPC: false }));
    const npcPlayers = NPC_PLAYERS.map(npc => ({ ...npc, isNPC: true }));
    const all = [...realPlayers, ...npcPlayers];
    return all.sort((a, b) => b.total_score - a.total_score).slice(0, 20);
  }, [leaderboard]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>MindClash</h1>
        <p style={styles.subtitle}>Test your knowledge in Physics, Chemistry, and Math!</p>
      </div>

      {user && (
        <div style={styles.statsCard}>
          <h3>Welcome, {user.username}! 👋</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{totalScore || 0}</div>
              <div style={styles.statLabel}>Total Score</div>
            </div>
            {subjects.map(sub => (
              <div key={sub.id} style={styles.statItem}>
                <div style={styles.statValue}>{getProgressLevel(progress, sub.id)}/10</div>
                <div style={styles.statLabel}>{sub.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {activeTab === "subjects" && (
        <div style={styles.subjectsGrid}>
          {subjects.map((subject) => (
            <Link to={`/subject/${subject.id}`} key={subject.id} style={styles.subjectCard}>
              <div style={{ ...styles.subjectIcon, background: subject.color }}>
                {subject.icon}
              </div>
              <h3 style={styles.subjectName}>{subject.name}</h3>
              <div style={styles.levelProgress}>
                Level {getProgressLevel(progress, subject.id)} / 10
              </div>
              <button style={styles.playButton}>Play →</button>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div style={styles.leaderboardCard}>
          <h2 style={styles.leaderboardTitle}>🏆 Top Players</h2>
          <div style={styles.leaderboardList}>
            {combinedLeaderboard.map((player, index) => {
              const isYou = user && player.username === user.username && !player.isNPC;
              const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
              
              return (
                <div key={index} style={{
                  ...styles.leaderboardItem,
                  ...(isYou && styles.leaderboardItemYou)
                }}>
                  <div style={styles.rank}>{medal}</div>
                  <div style={styles.playerName}>
                    {player.username}
                    {isYou && <span style={styles.youBadge}>YOU</span>}
                    {player.isNPC && <span style={styles.npcBadge}>NPC</span>}
                  </div>
                  <div style={styles.playerScore}>{player.total_score} pts</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#0a0a1a", padding: "40px 20px", color: "#fff" },
  header: { textAlign: "center", marginBottom: "40px" },
  title: { fontSize: "48px", color: "#e94560" },
  subtitle: { color: "#888" },
  statsCard: { maxWidth: "800px", margin: "0 auto 40px", background: "#1a1a2e", padding: "20px", borderRadius: "12px", border: "1px solid #333" },
  statsGrid: { display: "flex", justifyContent: "space-around", marginTop: "15px", flexWrap: "wrap", gap: "15px" },
  statItem: { textAlign: "center" },
  statValue: { fontSize: "24px", fontWeight: "bold", color: "#e94560" },
  statLabel: { fontSize: "12px", color: "#888" },
  tabs: { display: "flex", justifyContent: "center", gap: "20px", marginBottom: "40px" },
  tab: { padding: "10px 25px", background: "#1a1a2e", color: "#888", border: "1px solid #333", borderRadius: "8px", cursor: "pointer" },
  activeTab: { padding: "10px 25px", background: "#e94560", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
  subjectsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", maxWidth: "1000px", margin: "0 auto" },
  subjectCard: { background: "#1a1a2e", padding: "20px", borderRadius: "12px", textAlign: "center", textDecoration: "none", border: "1px solid #333" },
  subjectIcon: { width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px", fontSize: "30px" },
  subjectName: { color: "#fff" },
  levelProgress: { color: "#888", fontSize: "13px", margin: "10px 0" },
  playButton: { background: "#e94560", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
  leaderboardCard: { maxWidth: "600px", margin: "0 auto", background: "#1a1a2e", padding: "20px", borderRadius: "12px", border: "1px solid #333" },
  leaderboardTitle: { textAlign: "center", marginBottom: "20px", color: "#e94560" },
  leaderboardList: { display: "flex", flexDirection: "column", gap: "10px", maxHeight: "500px", overflowY: "auto" },
  leaderboardItem: { display: "grid", gridTemplateColumns: "70px 1fr 100px", alignItems: "center", padding: "12px", background: "#0a0a1a", borderRadius: "8px" },
  rank: { fontSize: "20px", fontWeight: "bold" },
  playerName: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  playerScore: { textAlign: "right", fontWeight: "bold", color: "#e94560" },
  leaderboardItemYou: { background: "rgba(233, 69, 96, 0.15)", border: "1px solid rgba(233, 69, 96, 0.3)" },
  youBadge: { background: "#238636", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" },
  npcBadge: { background: "#533483", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" },
};