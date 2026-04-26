import { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function SubjectPage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { progress } = useContext(AppContext);
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [selectedPhysicsGame, setSelectedPhysicsGame] = useState('cannon');
  const [mode, setMode] = useState('game');

  const subjects = {
    physics: { name: 'Physics', icon: '⚛️', color: '#00c8ff' },
    chemistry: { name: 'Chemistry', icon: '🧪', color: '#8060ff' },
    math: { name: 'Math', icon: '📐', color: '#FAC775' }
  };

  const currentSubject = subjects[subject];

  // Игры из папки levels для физики - ВНИМАНИЕ: id маленькими буквами!
  const physicsGames = [
    { id: 'cannon', name: 'Ballistic Cannon', icon: '🚀' },
    { id: 'optics', name: 'Optics & Light', icon: '🔦' },
    { id: 'circuit', name: 'Electric Circuits', icon: '⚡' },
    { id: 'hydraulic', name: 'Hydraulic Press', icon: '💧' },
    { id: 'orbit', name: 'Orbital Motion', icon: '🌍' }
  ];

  const getProgress = (key) => progress?.[`${subject}_${key}`] || 0;

  const startGame = () => {
    const route = mode === 'game' ? 'game' : 'quiz';
    
    if (mode === 'game') {
      if (subject === 'physics') {
        navigate(`/${route}/${subject}/${selectedPhysicsGame}/1`);
      } else {
        navigate(`/${route}/${subject}/${selectedDifficulty}/1`);
      }
    } else {
      navigate(`/${route}/${subject}/general/1`);
    }
  };

  if (!currentSubject) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
        <h1 style={styles.title}>
          <span style={{ filter: `drop-shadow(0 0 8px ${currentSubject.color})` }}>
            {currentSubject.icon}
          </span> 
          {currentSubject.name}
        </h1>
      </div>

      <div style={styles.content}>
        <div style={styles.modeSelector}>
          <button 
            style={{ ...styles.modeBtn, ...(mode === 'game' && { ...styles.modeActive, background: '#e94560' }) }}
            onClick={() => setMode('game')}
          >
            🎮 GAME MODE
          </button>
          <button 
            style={{ ...styles.modeBtn, ...(mode === 'quiz' && { ...styles.modeActive, background: '#e94560' }) }}
            onClick={() => setMode('quiz')}
          >
            📝 QUIZ MODE
          </button>
        </div>

        <h3 style={styles.sectionTitle}>
          {mode === 'game' ? '📊 Select Challenge' : '🧠 Final Assessment'}
        </h3>
        
        {mode === 'game' ? (
          subject === 'physics' ? (
            physicsGames.map(game => (
              <div 
                key={game.id}
                style={{ 
                  ...styles.progressCard, 
                  borderColor: selectedPhysicsGame === game.id ? currentSubject.color : '#30363d',
                  boxShadow: selectedPhysicsGame === game.id ? `0 0 15px ${currentSubject.color}33` : 'none'
                }}
                onClick={() => setSelectedPhysicsGame(game.id)}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>{game.icon}</span>
                  <span style={styles.cardTitle}>{game.name}</span>
                  <span style={styles.progressValue}>{getProgress(game.id)}/10</span>
                </div>
                <div style={styles.barBackground}>
                  <div style={{ 
                    ...styles.barFill, 
                    width: `${(getProgress(game.id) / 10) * 100}%`,
                    background: `linear-gradient(90deg, ${currentSubject.color}, #fff)` 
                  }} />
                </div>
              </div>
            ))
          ) : (
            ['easy', 'medium', 'hard'].map(diff => (
              <div 
                key={diff}
                style={{ 
                  ...styles.progressCard, 
                  borderColor: selectedDifficulty === diff ? currentSubject.color : '#30363d',
                  boxShadow: selectedDifficulty === diff ? `0 0 15px ${currentSubject.color}33` : 'none'
                }}
                onClick={() => setSelectedDifficulty(diff)}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardTitle}>{diff.toUpperCase()}</span>
                  <span style={styles.progressValue}>{getProgress(diff)}/10</span>
                </div>
                <div style={styles.barBackground}>
                  <div style={{ 
                    ...styles.barFill, 
                    width: `${(getProgress(diff) / 10) * 100}%`,
                    background: `linear-gradient(90deg, ${currentSubject.color}, #fff)` 
                  }} />
                </div>
              </div>
            ))
          )
        ) : (
          <div 
            style={{ 
              ...styles.progressCard, 
              borderColor: currentSubject.color, 
              background: 'linear-gradient(145deg, #161b22 0%, #1c2128 100%)',
              padding: '30px',
              textAlign: 'center'
            }}
            onClick={startGame}
          >
            <span style={{ fontSize: '40px', marginBottom: '10px', display: 'block' }}>🏆</span>
            <h2 style={{ color: '#fff', marginBottom: '10px' }}>{currentSubject.name} Marathon</h2>
            <p style={{ color: '#8b949e', fontSize: '14px', marginBottom: '20px' }}>
              Mixed questions from all modules. No difficulty limits.
            </p>
            <div style={styles.barBackground}>
              <div style={{ 
                ...styles.barFill, 
                width: `${(getProgress('quiz_total') / 20) * 100}%`,
                backgroundColor: currentSubject.color 
              }} />
            </div>
          </div>
        )}

        <button style={{...styles.startBtn, background: `linear-gradient(135deg, ${currentSubject.color} 0%, #e94560 100%)`}} onClick={startGame}>
          {mode === 'game' ? 'LAUNCH MISSION →' : 'START QUIZ →'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    minHeight: '100vh', 
    background: '#0d1117', 
    padding: '30px 20px',
    fontFamily: "'Rajdhani', sans-serif" 
  },
  header: { maxWidth: '700px', margin: '0 auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: '8px 20px', background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', color: '#fff', cursor: 'pointer' },
  title: { fontSize: '28px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' },
  content: { maxWidth: '700px', margin: '0 auto' },
  
  modeSelector: { display: 'flex', gap: '15px', marginBottom: '30px' },
  modeBtn: { 
    flex: 1, padding: '14px', background: '#161b22', border: '1px solid #30363d', 
    borderRadius: '12px', color: '#8b949e', fontSize: '14px', fontWeight: '800', cursor: 'pointer', transition: '0.3s' 
  },
  modeActive: { color: '#fff', border: 'none', boxShadow: '0 0 15px rgba(233, 69, 96, 0.4)' },
  
  sectionTitle: { color: '#8b949e', fontSize: '16px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' },
  
  progressCard: { 
    background: '#161b22', borderRadius: '14px', padding: '18px', marginBottom: '12px', 
    border: '1.5px solid', cursor: 'pointer', transition: '0.2s transform ease'
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  cardIcon: { fontSize: '22px' },
  cardTitle: { flex: 1, color: '#fff', fontWeight: '700', fontSize: '18px' },
  progressValue: { color: '#8b949e', fontSize: '13px', fontWeight: '600' },
  
  barBackground: { width: '100%', height: '6px', background: '#0d1117', borderRadius: '10px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '10px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' },
  
  startBtn: { 
    width: '100%', padding: '18px', border: 'none', borderRadius: '12px', 
    color: '#fff', fontSize: '18px', fontWeight: '900', cursor: 'pointer', 
    marginTop: '20px', boxShadow: '0 8px 25px rgba(233, 69, 96, 0.25)', textTransform: 'uppercase'
  }
};