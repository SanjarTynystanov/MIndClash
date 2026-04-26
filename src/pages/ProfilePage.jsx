import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import LevelBadge from '../components/LevelBadge';

// Функция для получения ранга
const getRank = (progress) => {
  const hardCompleted = progress?.hard || 0;
  const mediumCompleted = progress?.medium || 0;
  const easyCompleted = progress?.easy || 0;
  
  if (hardCompleted >= 5) return { name: "MASTER", icon: "👑", color: "#e94560" };
  if (mediumCompleted >= 5) return { name: "EXPERT", icon: "⚙️", color: "#FAC775" };
  if (easyCompleted >= 5) return { name: "NOVICE", icon: "🌱", color: "#4fc3f7" };
  return { name: "LEARNER", icon: "📘", color: "#888" };
};

export default function ProfilePage() {
  const { user, progress, stats, loading } = useContext(AppContext);
  const [settings, setSettings] = useState({
    language: 'ru',
    dynamicDifficulty: true,
    glitchEffects: true,
    screenShake: true,
    timerTick: true,
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(`setting_${key}`, value);
  };

  if (loading) {
    return <div style={styles.loading}>Loading profile...</div>;
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>🔒 Authentication Required</h2>
          <button onClick={() => window.location.href = '/auth'}>Go to Login</button>
        </div>
      </div>
    );
  }

  const userInfo = user;

  const getProgressValue = (subject, difficulty) => {
    const subjProgress = progress?.[`${subject}_${difficulty}`];
    if (typeof subjProgress === 'number') return subjProgress;
    if (subjProgress?.levelCompleted !== undefined) return subjProgress.levelCompleted;
    return 0;
  };

  const subjects = [
    { id: 'physics', name: 'Physics', icon: '⚛️', color: '#e94560' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: '#533483' },
    { id: 'math', name: 'Math', icon: '📐', color: '#0f3460' }
  ];

  const rank = getRank({
    easy: getProgressValue('math', 'easy'),
    medium: getProgressValue('math', 'medium'),
    hard: getProgressValue('math', 'hard')
  });

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
              <LevelBadge level={userInfo.level} size="md" />
              <span style={styles.rankBadge}>
                {rank.icon} {rank.name}
              </span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div style={styles.xpContainer}>
          <div style={styles.xpHeader}>
            <span>XP Progress</span>
            <span>{userInfo.xp} / {userInfo.xpNeededForNext}</span>
          </div>
          <div style={styles.xpBar}>
            <div style={{ width: `${(userInfo.xp / userInfo.xpNeededForNext) * 100}%`, height: '100%', background: '#e94560', borderRadius: '99px' }} />
          </div>
        </div>

        {/* Статистика */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statCardValue}>{stats?.total_games || 0}</div>
            <div style={styles.statCardLabel}>Games</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statCardValue}>{stats?.total_wins || 0}</div>
            <div style={styles.statCardLabel}>Wins</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statCardValue}>
              {stats?.total_wins && stats?.total_games ? Math.round((stats.total_wins / stats.total_games) * 100) : 0}%
            </div>
            <div style={styles.statCardLabel}>Win Rate</div>
          </div>
        </div>

        {/* Прогресс по предметам с тремя шкалами */}
        <div style={styles.subjectsSection}>
          <h3>📚 Subject Progress</h3>
          {subjects.map(subject => {
            const easy = getProgressValue(subject.id, 'easy');
            const medium = getProgressValue(subject.id, 'medium');
            const hard = getProgressValue(subject.id, 'hard');
            return (
              <div key={subject.id} style={styles.subjectCard}>
                <div style={styles.subjectHeader}>
                  <span>{subject.icon}</span>
                  <span>{subject.name}</span>
                </div>
                <div style={styles.difficultyRow}>
                  <span style={styles.difficultyLabel}>🟢 Easy</span>
                  <div style={styles.smallProgressBar}>
                    <div style={{ width: `${(easy / 10) * 100}%`, background: "#4fc3f7", height: '100%', borderRadius: '99px' }} />
                  </div>
                  <span>{easy}/10</span>
                </div>
                <div style={styles.difficultyRow}>
                  <span style={styles.difficultyLabel}>🟡 Medium</span>
                  <div style={styles.smallProgressBar}>
                    <div style={{ width: `${(medium / 10) * 100}%`, background: "#FAC775", height: '100%', borderRadius: '99px' }} />
                  </div>
                  <span>{medium}/10</span>
                </div>
                <div style={styles.difficultyRow}>
                  <span style={styles.difficultyLabel}>🔴 Hard</span>
                  <div style={styles.smallProgressBar}>
                    <div style={{ width: `${(hard / 10) * 100}%`, background: "#e94560", height: '100%', borderRadius: '99px' }} />
                  </div>
                  <span>{hard}/10</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Достижения */}
        <div style={styles.achievementsSection}>
          <h3>🏅 Achievements</h3>
          <div style={styles.achievementsGrid}>
            {userInfo.level >= 5 && <div>🌟 Level 5 Master</div>}
            {(stats?.total_perfect_games || 0) >= 1 && <div>💯 Perfect Game</div>}
            {getProgressValue('math', 'hard') >= 5 && <div>🐙 Deep Diver (5 Hard tasks)</div>}
          </div>
        </div>

        {/* Настройки */}
        <div style={styles.settingsSection}>
          <h3>⚙️ Settings</h3>
          
          <div style={styles.settingRow}>
            <span>🌐 Language</span>
            <div style={styles.langButtons}>
              <button onClick={() => updateSetting('language', 'ru')} style={{ ...styles.langBtn, background: settings.language === 'ru' ? '#e94560' : '#333' }}>🇷🇺 RU</button>
              <button onClick={() => updateSetting('language', 'en')} style={{ ...styles.langBtn, background: settings.language === 'en' ? '#e94560' : '#333' }}>🇬🇧 EN</button>
            </div>
          </div>
          
          <div style={styles.settingRow}>
            <span>🎯 Dynamic Difficulty</span>
            <label style={styles.toggle}>
              <input type="checkbox" checked={settings.dynamicDifficulty} onChange={(e) => updateSetting('dynamicDifficulty', e.target.checked)} />
              <span style={styles.toggleSlider}></span>
            </label>
          </div>
          
          <div style={styles.settingRow}>
            <span>💥 Glitch Effects</span>
            <label style={styles.toggle}>
              <input type="checkbox" checked={settings.glitchEffects} onChange={(e) => updateSetting('glitchEffects', e.target.checked)} />
              <span style={styles.toggleSlider}></span>
            </label>
          </div>
          
          <div style={styles.settingRow}>
            <span>📳 Screen Shake</span>
            <label style={styles.toggle}>
              <input type="checkbox" checked={settings.screenShake} onChange={(e) => updateSetting('screenShake', e.target.checked)} />
              <span style={styles.toggleSlider}></span>
            </label>
          </div>
          
          <div style={styles.settingRow}>
            <span>⏱️ Timer Tick</span>
            <label style={styles.toggle}>
              <input type="checkbox" checked={settings.timerTick} onChange={(e) => updateSetting('timerTick', e.target.checked)} />
              <span style={styles.toggleSlider}></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a1a', padding: '40px 20px' },
  profileCard: { maxWidth: '900px', margin: '0 auto', background: '#1a1a2e', borderRadius: '24px', padding: '30px', border: '1px solid #333' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '30px', flexWrap: 'wrap' },
  avatar: { width: '100px', height: '100px', background: 'linear-gradient(135deg, #e94560, #FAC775)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 'bold', color: '#fff' },
  userInfo: { flex: 1 },
  username: { color: '#fff', fontSize: '28px', marginBottom: '8px' },
  badgeRow: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  rankBadge: { background: 'rgba(233, 69, 96, 0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: '#e94560' },
  xpContainer: { marginBottom: '30px' },
  xpHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#888' },
  xpBar: { height: '12px', background: '#0a0a1a', borderRadius: '99px', overflow: 'hidden' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '30px' },
  statCard: { background: '#0a0a1a', borderRadius: '12px', padding: '16px', textAlign: 'center' },
  statCardValue: { fontSize: '28px', fontWeight: 'bold', color: '#e94560' },
  statCardLabel: { fontSize: '12px', color: '#888', marginTop: '4px' },
  subjectsSection: { marginBottom: '30px' },
  subjectCard: { background: '#0a0a1a', borderRadius: '12px', padding: '16px', marginBottom: '12px' },
  subjectHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '18px', fontWeight: 'bold', color: '#fff' },
  difficultyRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', fontSize: '13px', color: '#c9d1d9' },
  difficultyLabel: { width: '70px' },
  smallProgressBar: { flex: 1, height: '6px', background: '#333', borderRadius: '99px', overflow: 'hidden' },
  achievementsSection: { marginBottom: '30px' },
  achievementsGrid: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
  settingsSection: { marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #333' },
  settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#c9d1d9' },
  langButtons: { display: 'flex', gap: '8px' },
  langBtn: { padding: '6px 12px', borderRadius: '6px', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' },
  toggle: { position: 'relative', display: 'inline-block', width: '50px', height: '24px' },
  toggleSlider: { position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: '#333', borderRadius: '24px', transition: '0.3s' },
  loading: { textAlign: 'center', color: '#888', fontSize: '18px', padding: '40px' },
  card: { maxWidth: '500px', margin: '100px auto', background: '#1a1a2e', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#fff' },
};

// Добавляем CSS для toggle
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    input { opacity: 0; width: 0; height: 0; position: absolute; }
    .toggleSlider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background: #fff;
      border-radius: 50%;
      transition: 0.3s;
    }
    input:checked + .toggleSlider { background: #e94560; }
    input:checked + .toggleSlider:before { transform: translateX(26px); }
  `;
  document.head.appendChild(style);
}