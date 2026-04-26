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
  const exact = progress[subject];
  if (typeof exact === "number") return exact;
  if (exact && exact.levelCompleted !== undefined) return exact.levelCompleted;

  const difficulties = ["easy", "medium", "hard"];
  const best = difficulties.reduce((max, diff) => {
    const key = `${subject}_${diff}`;
    const value = progress[key];
    if (typeof value === 'number') return Math.max(max, value);
    if (value && value.levelCompleted !== undefined) return Math.max(max, value.levelCompleted);
    return max;
  }, 0);
  return best;
};

export default function HomePage() {
  const { user, progress, totalScore, leaderboard } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("subjects");
  const [hoveredSubject, setHoveredSubject] = useState(null);

  console.log("HomePage - progress:", progress);
  console.log("HomePage - totalScore:", totalScore);

  const subjects = [
    { id: "physics", name: "Physics", icon: "⚛️", color: "#e94560", description: "Master the laws of physics" },
    { id: "chemistry", name: "Chemistry", icon: "🧪", color: "#533483", description: "Explore chemical reactions" },
    { id: "math", name: "Math", icon: "📐", color: "#0f3460", description: "Solve complex problems" },
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
        <div style={styles.titleWrapper}>
          <span style={styles.titleIcon}>🧠</span>
          <h1 style={styles.title}>MindClash</h1>
        </div>
        <p style={styles.subtitle}>Test your knowledge in Physics, Chemistry, and Math!</p>
      </div>

      {user && (
        <div style={styles.statsCard}>
          <div style={styles.welcomeRow}>
            <h3 style={styles.welcomeText}>Welcome, {user.username}! 👋</h3>
            <div style={styles.levelChip}>Level {user.level || 1}</div>
          </div>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statIcon}>🏆</div>
              <div style={styles.statValue}>{totalScore || 0}</div>
              <div style={styles.statLabel}>Total Score</div>
            </div>
            {subjects.map(sub => (
              <div key={sub.id} style={styles.statItem}>
                <div style={styles.statIcon}>{sub.icon}</div>
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
          <span style={styles.tabIcon}>📚</span>
          Subjects
        </button>
        <button 
          onClick={() => setActiveTab("leaderboard")}
          style={activeTab === "leaderboard" ? styles.activeTab : styles.tab}
        >
          <span style={styles.tabIcon}>🏆</span>
          Leaderboard
        </button>
      </div>

      {activeTab === "subjects" && (
        <div style={styles.subjectsGrid}>
          {subjects.map((subject) => {
            const progressLevel = getProgressLevel(progress, subject.id);
            const isHovered = hoveredSubject === subject.id;
            
            return (
              <Link 
                to={`/subject/${subject.id}`} 
                key={subject.id} 
                style={{
                  ...styles.subjectCard,
                  ...(isHovered && styles.subjectCardHover),
                  borderColor: isHovered ? subject.color : '#333'
                }}
                onMouseEnter={() => setHoveredSubject(subject.id)}
                onMouseLeave={() => setHoveredSubject(null)}
              >
                <div style={{ ...styles.subjectIcon, background: subject.color }}>
                  {subject.icon}
                </div>
                <h3 style={styles.subjectName}>{subject.name}</h3>
                <p style={styles.subjectDesc}>{subject.description}</p>
                <div style={styles.progressInfo}>
                  <span style={styles.progressLabel}>Progress</span>
                  <span style={styles.progressValue}>{progressLevel}/10</span>
                </div>
                <button style={{ ...styles.playButton, background: subject.color }}>
                  {isHovered ? 'Play Now →' : 'Start Challenge'}
                </button>
              </Link>
            );
          })}
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div style={styles.leaderboardCard}>
          <div style={styles.leaderboardHeader}>
            <h2 style={styles.leaderboardTitle}>🏆 Top Players</h2>
            <span style={styles.leaderboardCount}>👥 {combinedLeaderboard.length}</span>
          </div>
          <div style={styles.leaderboardList}>
            {combinedLeaderboard.map((player, index) => {
              const isYou = user && player.username === user.username && !player.isNPC;
              const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null;
              
              const rankFrame = 
                index === 0 ? styles.rankGold : 
                index === 1 ? styles.rankSilver : 
                index === 2 ? styles.rankBronze : 
                null;
              
              return (
                <div 
                  key={index} 
                  style={{
                    ...styles.leaderboardItem,
                    ...(rankFrame),
                    ...(isYou && styles.leaderboardItemYou)
                  }}
                >
                  <div style={styles.rank}>
                    {medal || <span style={styles.rankNumber}>#{index + 1}</span>}
                  </div>
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
  container: { 
    minHeight: "100vh", 
    background: "linear-gradient(135deg, #0a0a1a 0%, #0f0f2a 100%)", 
    padding: "40px 20px", 
    color: "#fff" 
  },
  header: { 
    textAlign: "center", 
    marginBottom: "50px",
    animation: "fadeInDown 0.6s ease"
  },
  titleWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "10px"
  },
  titleIcon: { 
    fontSize: "48px",
    animation: "pulse 2s infinite"
  },
  title: { 
    fontSize: "52px", 
    background: "linear-gradient(135deg, #e94560, #FAC775)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0
  },
  subtitle: { 
    color: "#888", 
    fontSize: "18px" 
  },
  statsCard: { 
    maxWidth: "900px", 
    margin: "0 auto 50px", 
    background: "rgba(26, 26, 46, 0.95)", 
    padding: "24px", 
    borderRadius: "20px", 
    border: "1px solid rgba(233, 69, 96, 0.2)",
    backdropFilter: "blur(10px)",
    animation: "fadeInUp 0.6s ease"
  },
  welcomeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #333"
  },
  welcomeText: {
    fontSize: "22px",
    margin: 0
  },
  levelChip: {
    background: "linear-gradient(135deg, #e94560, #FAC775)",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "bold"
  },
  statsGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
    gap: "20px" 
  },
  statItem: { 
    textAlign: "center",
    padding: "15px",
    background: "rgba(10, 10, 26, 0.5)",
    borderRadius: "16px",
    transition: "transform 0.3s"
  },
  statIcon: { 
    fontSize: "28px", 
    marginBottom: "8px" 
  },
  statValue: { 
    fontSize: "28px", 
    fontWeight: "bold", 
    color: "#e94560" 
  },
  statLabel: { 
    fontSize: "12px", 
    color: "#888",
    marginTop: "5px"
  },
  tabs: { 
    display: "flex", 
    justifyContent: "center", 
    gap: "20px", 
    marginBottom: "40px" 
  },
  tab: { 
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 30px", 
    background: "rgba(26, 26, 46, 0.8)", 
    color: "#888", 
    border: "1px solid #333", 
    borderRadius: "12px", 
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.3s"
  },
  activeTab: { 
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 30px", 
    background: "linear-gradient(135deg, #e94560, #FAC775)", 
    color: "#fff", 
    border: "none", 
    borderRadius: "12px", 
    cursor: "pointer",
    fontSize: "16px"
  },
  tabIcon: { fontSize: "20px" },
  subjectsGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
    gap: "30px", 
    maxWidth: "1100px", 
    margin: "0 auto" 
  },
  subjectCard: { 
    background: "#1a1a2e", 
    padding: "30px", 
    borderRadius: "20px", 
    textAlign: "center", 
    textDecoration: "none", 
    border: "2px solid #333",
    transition: "all 0.3s ease",
    animation: "fadeInUp 0.6s ease"
  },
  subjectCardHover: {
    transform: "translateY(-8px)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
  },
  subjectIcon: { 
    width: "80px", 
    height: "80px", 
    borderRadius: "50%", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    margin: "0 auto 20px", 
    fontSize: "40px",
    transition: "transform 0.3s"
  },
  subjectName: { 
    color: "#fff", 
    fontSize: "24px",
    marginBottom: "8px"
  },
  subjectDesc: {
    color: "#888",
    fontSize: "13px",
    marginBottom: "20px"
  },
  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    padding: "10px 15px",
    background: "rgba(10, 10, 26, 0.5)",
    borderRadius: "12px"
  },
  progressLabel: {
    fontSize: "13px",
    color: "#888"
  },
  progressValue: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#e94560"
  },
  playButton: { 
    color: "#fff", 
    border: "none", 
    padding: "12px 25px", 
    borderRadius: "30px", 
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.3s",
    width: "100%"
  },
  leaderboardCard: { 
    maxWidth: "650px", 
    margin: "0 auto", 
    background: "rgba(26, 26, 46, 0.95)", 
    padding: "25px", 
    borderRadius: "20px", 
    border: "1px solid rgba(233, 69, 96, 0.2)",
    backdropFilter: "blur(10px)",
    animation: "fadeInUp 0.6s ease"
  },
  leaderboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #333"
  },
  leaderboardTitle: { 
    margin: 0, 
    color: "#e94560" 
  },
  leaderboardCount: {
    color: "#888",
    fontSize: "14px"
  },
  leaderboardList: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "10px", 
    maxHeight: "500px", 
    overflowY: "auto" 
  },
  leaderboardItem: { 
    display: "grid", 
    gridTemplateColumns: "70px 1fr 100px", 
    alignItems: "center", 
    padding: "12px 15px", 
    background: "rgba(10, 10, 26, 0.8)", 
    borderRadius: "12px",
    transition: "all 0.3s",
    animation: "slideIn 0.4s ease forwards",
    opacity: 0,
    transform: "translateX(-20px)"
  },
  rank: { 
    fontSize: "28px", 
    fontWeight: "bold",
    textAlign: "center"
  },
  rankNumber: {
    fontSize: "16px",
    color: "#888"
  },
  playerName: { 
    display: "flex", 
    alignItems: "center", 
    gap: "8px", 
    flexWrap: "wrap",
    fontSize: "16px",
    fontWeight: "500"
  },
  playerScore: { 
    textAlign: "right", 
    fontWeight: "bold", 
    color: "#e94560",
    fontSize: "18px"
  },
  leaderboardItemYou: { 
    background: "rgba(233, 69, 96, 0.15)", 
    border: "1px solid rgba(233, 69, 96, 0.3)" 
  },
  youBadge: { 
    background: "#238636", 
    color: "#fff", 
    fontSize: "10px", 
    padding: "2px 8px", 
    borderRadius: "10px", 
    fontWeight: "bold" 
  },
  npcBadge: { 
    background: "#533483", 
    color: "#fff", 
    fontSize: "10px", 
    padding: "2px 8px", 
    borderRadius: "10px", 
    fontWeight: "bold" 
  },
  rankGold: { 
    border: '2px solid #FFD700', 
    boxShadow: '0 0 15px rgba(255,215,0,0.4)',
    background: 'linear-gradient(90deg, rgba(255,215,0,0.08), rgba(255,215,0,0.02))'
  },
  rankSilver: { 
    border: '2px solid #C0C0C0', 
    boxShadow: '0 0 15px rgba(192,192,192,0.3)',
    background: 'linear-gradient(90deg, rgba(192,192,192,0.08), rgba(192,192,192,0.02))'
  },
  rankBronze: { 
    border: '2px solid #CD7F32', 
    boxShadow: '0 0 15px rgba(205,127,50,0.3)',
    background: 'linear-gradient(90deg, rgba(205,127,50,0.08), rgba(205,127,50,0.02))'
  },
};

// Добавляем CSS анимации
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideIn {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    .leaderboardList::-webkit-scrollbar {
      width: 6px;
    }
    
    .leaderboardList::-webkit-scrollbar-track {
      background: #1a1a2e;
      border-radius: 10px;
    }
    
    .leaderboardList::-webkit-scrollbar-thumb {
      background: #e94560;
      border-radius: 10px;
    }
  `;
  document.head.appendChild(style);
}