import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import LevelBadge from '../components/LevelBadge'; // Импортируем компонент

export default function ProfilePage() {
  const { user, token } = useContext(AppContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:3001/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          console.log('Profile data:', data);
          setProfileData(data);
        }
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [token]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.errorTitle}>🔒 Authentication Required</h2>
          <p style={styles.errorText}>Please log in to view your profile.</p>
          <button onClick={() => window.location.href = '/auth'} style={styles.button}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.errorTitle}>⚠️ Failed to Load Profile</h2>
          <p style={styles.errorText}>Unable to load your profile data.</p>
          <button onClick={() => window.location.reload()} style={styles.button}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user: userInfo, progress, stats } = profileData;
  
  // Безопасное получение прогресса по предметам
  const getProgressValue = (subject) => {
    const subjProgress = progress?.[subject];
    if (typeof subjProgress === 'number') return subjProgress;
    if (subjProgress?.levelCompleted !== undefined) return subjProgress.levelCompleted;
    return 0;
  };
  
  const getBestScore = (subject) => {
    const subjProgress = progress?.[subject];
    if (typeof subjProgress === 'number') return 0;
    if (subjProgress?.bestScore !== undefined) return subjProgress.bestScore;
    return 0;
  };
  
  const levelProgress = userInfo.xpNeededForNext 
    ? (userInfo.xp / userInfo.xpNeededForNext) * 100 
    : 0;

  const subjects = [
    { id: 'physics', name: 'Physics', icon: '⚛️', color: '#e94560' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: '#533483' },
    { id: 'math', name: 'Math', icon: '📐', color: '#0f3460' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.profileCard}>
        {/* Avatar и основная информация */}
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {userInfo.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={styles.userInfo}>
            <h2 style={styles.username}>{userInfo.username}</h2>
            <div style={styles.badgeRow}>
              {/* ИСПОЛЬЗУЕМ LevelBadge вместо обычного текста */}
              <LevelBadge level={userInfo.level} size="md" />
              <span style={styles.streakBadge}>🔥 Streak: {userInfo.streak || 0}</span>
            </div>
            {userInfo.highest_streak > 0 && (
              <div style={styles.highestStreak}>🏆 Best Streak: {userInfo.highest_streak}</div>
            )}
          </div>
        </div>

        {/* XP Bar */}
        <div style={styles.xpContainer}>
          <div style={styles.xpHeader}>
            <span style={styles.xpLabel}>XP Progress</span>
            <span style={styles.xpValue}>{userInfo.xp} / {userInfo.xpNeededForNext}</span>
          </div>
          <div style={styles.xpBar}>
            <div style={{ ...styles.xpFill, width: `${Math.min(levelProgress, 100)}%` }} />
          </div>
          <div style={styles.xpHint}>
            {userInfo.xpToNextLevel} XP to Level {userInfo.level + 1}
          </div>
        </div>

        {/* Статистика */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats?.total_games || 0}</div>
            <div style={styles.statLabel}>Games Played</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats?.total_wins || 0}</div>
            <div style={styles.statLabel}>Wins</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {stats?.total_games > 0 
                ? Math.round((stats.total_wins / stats.total_games) * 100) 
                : 0}%
            </div>
            <div style={styles.statLabel}>Win Rate</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats?.total_perfect_games || 0}</div>
            <div style={styles.statLabel}>Perfect Games</div>
          </div>
        </div>

        {/* Прогресс по предметам */}
        <div style={styles.subjectsSection}>
          <h3 style={styles.sectionTitle}>📚 Subject Progress</h3>
          <div style={styles.subjectsGrid}>
            {subjects.map(subject => {
              const completed = getProgressValue(subject.id);
              const bestScore = getBestScore(subject.id);
              return (
                <div key={subject.id} style={styles.subjectCard}>
                  <div style={styles.subjectHeader}>
                    <span style={styles.subjectIcon}>{subject.icon}</span>
                    <span style={styles.subjectName}>{subject.name}</span>
                    <span style={styles.subjectLevel}>Level {completed}/10</span>
                  </div>
                  <div style={styles.subjectProgressBar}>
                    <div style={{ ...styles.subjectProgressFill, width: `${(completed / 10) * 100}%`, background: subject.color }} />
                  </div>
                  <div style={styles.subjectStats}>
                    <span style={styles.subjectBest}>🏆 Best Score: {bestScore}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Достижения */}
        <div style={styles.achievementsSection}>
          <h3 style={styles.sectionTitle}>🏅 Achievements</h3>
          <div style={styles.achievementsGrid}>
            {userInfo.level >= 5 && (
              <div style={styles.achievement}>
                <span>🌟</span> Level 5 Master
              </div>
            )}
            {(userInfo.highest_streak || userInfo.streak) >= 3 && (
              <div style={styles.achievement}>
                <span>🔥</span> 3-Day Streak
              </div>
            )}
            {(stats?.total_perfect_games || 0) >= 1 && (
              <div style={styles.achievement}>
                <span>💯</span> Perfect Game
              </div>
            )}
            {Object.keys(progress || {}).length >= 3 && (
              <div style={styles.achievement}>
                <span>🎓</span> All Subjects
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a1a',
    padding: '40px 20px',
  },
  profileCard: {
    maxWidth: '900px',
    margin: '0 auto',
    background: '#1a1a2e',
    borderRadius: '24px',
    padding: '30px',
    border: '1px solid #333',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  avatar: {
    width: '100px',
    height: '100px',
    background: 'linear-gradient(135deg, #e94560, #533483)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: '#fff',
    fontSize: '28px',
    marginBottom: '8px',
  },
  badgeRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  streakBadge: {
    display: 'inline-block',
    background: '#FAC775',
    color: '#1a1a2e',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
  },
  highestStreak: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#888',
  },
  xpContainer: {
    marginBottom: '30px',
  },
  xpHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  },
  xpLabel: {
    color: '#888',
  },
  xpValue: {
    color: '#FAC775',
  },
  xpBar: {
    height: '12px',
    background: '#0a0a1a',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #e94560, #FAC775)',
    borderRadius: '99px',
    transition: 'width 0.3s ease',
  },
  xpHint: {
    fontSize: '11px',
    color: '#888',
    marginTop: '6px',
    textAlign: 'right',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '30px',
  },
  statCard: {
    background: '#0a0a1a',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#e94560',
  },
  statLabel: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
  subjectsSection: {
    marginBottom: '30px',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '20px',
    marginBottom: '16px',
  },
  subjectsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  subjectCard: {
    background: '#0a0a1a',
    borderRadius: '12px',
    padding: '16px',
  },
  subjectHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  subjectIcon: {
    fontSize: '24px',
  },
  subjectName: {
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
  },
  subjectLevel: {
    color: '#888',
    fontSize: '12px',
  },
  subjectProgressBar: {
    height: '6px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '99px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  subjectProgressFill: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.3s ease',
  },
  subjectStats: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
  },
  subjectBest: {
    color: '#FAC775',
  },
  achievementsSection: {
    marginTop: '20px',
  },
  achievementsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  achievement: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '14px',
    color: '#FAC775',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  loading: {
    textAlign: 'center',
    color: '#888',
    fontSize: '18px',
  },
  card: {
    maxWidth: '500px',
    margin: '100px auto',
    background: '#1a1a2e',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    border: '1px solid #333',
  },
  errorTitle: {
    color: '#e94560',
    fontSize: '24px',
    marginBottom: '16px',
  },
  errorText: {
    color: '#888',
    marginBottom: '20px',
  },
  button: {
    background: '#e94560',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    fontSize: '14px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px',
  },
};