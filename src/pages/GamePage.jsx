import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChemistryGame from '../games/ChemistryGame';
import PhysicsGame from '../games/PhysicsGame';
import MathGame from '../games/MathGame';

export default function GamePage() {
  const { subject, gameType, level } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  console.log("🎮 GamePage - subject:", subject, "gameType:", gameType, "level:", level);

  const games = {
    chemistry: { name: 'Chemistry', icon: '🧪', color: '#8060ff', component: ChemistryGame, maxLevel: 10 },
    physics: { name: 'Physics', icon: '⚛️', color: '#00c8ff', component: PhysicsGame, maxLevel: 10 },
    math: { name: 'Math', icon: '📐', color: '#FAC775', component: MathGame, maxLevel: 10 }
  };

  const currentGame = games[subject];
  const GameComponent = currentGame?.component;
  const currentLevel = parseInt(level) || 1;
  const maxLevel = currentGame?.maxLevel || 10;
  const currentGameType = gameType || 'easy';

  const handleComplete = (gameResult) => {
    console.log("Game completed:", gameResult);
    setResult(gameResult);
  };

  const handlePlayAgain = () => {
    setResult(null);
    navigate(`/game/${subject}/${currentGameType}/${currentLevel}`);
  };

  const handleNextLevel = () => {
    const nextLevel = currentLevel + 1;
    if (nextLevel <= maxLevel) {
      setResult(null);
      navigate(`/game/${subject}/${currentGameType}/${nextLevel}`);
    } else {
      setResult({ ...result, allCompleted: true });
    }
  };

  const handleBack = () => {
    navigate(`/subject/${subject}`);
  };

  if (!currentGame || !GameComponent) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2>❌ Game not found for {subject}</h2>
          <button onClick={handleBack}>Back to {subject}</button>
        </div>
      </div>
    );
  }

  if (result) {
    const win = result.success && result.win;
    const percent = result.total ? Math.round((result.score / result.total) * 100) : 100;
    const isLastLevel = currentLevel === maxLevel;
    const canGoNext = win && !isLastLevel;
    const allCompleted = result.allCompleted || (win && isLastLevel);
    
    return (
      <div style={styles.container}>
        <div style={{ ...styles.resultCard, borderColor: win ? '#4fc3f7' : '#e94560' }}>
          <div style={styles.resultEmoji}>{win ? '🎉✨🎉' : '😔💀😔'}</div>
          <h1 style={{ color: win ? '#4fc3f7' : '#e94560' }}>
            {win ? 'VICTORY!' : 'GAME OVER'}
          </h1>
          <div style={styles.scoreDisplay}>
            <div style={styles.scoreValue}>{result.score || 0}</div>
            <div style={styles.scoreTotal}>/{result.total || 10}</div>
          </div>
          <p>Accuracy: {percent}%</p>
          {result.perfect && (
            <div style={styles.perfectBadge}>💯 PERFECT! +5 XP</div>
          )}
          {win && !allCompleted && (
            <div style={styles.levelComplete}>✨ Level {currentLevel} Complete! ✨</div>
          )}
          {allCompleted && (
            <div style={styles.allComplete}>
              🏆 CONGRATULATIONS! You completed all levels! 🏆
            </div>
          )}
          
          <div style={styles.buttonGroup}>
            {canGoNext && (
              <button style={styles.nextBtn} onClick={handleNextLevel}>
                Next Level → ({currentLevel + 1}/{maxLevel})
              </button>
            )}
            <button style={styles.playAgainBtn} onClick={handlePlayAgain}>
              🔄 Play Again
            </button>
            <button style={styles.backBtn} onClick={handleBack}>
              ← Back to {currentGame.name}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.gameHeader}>
        <button style={styles.exitBtn} onClick={handleBack}>← Exit</button>
        <div style={styles.gameInfo}>
          <span>{currentGame.icon} {currentGame.name}</span>
          <span style={styles.gameTypeBadge}>
            {subject === 'physics' && currentGameType === 'cannon' && '🚀 Cannon'}
            {subject === 'physics' && currentGameType === 'optics' && '🔦 Optics'}
            {subject === 'physics' && currentGameType === 'circuit' && '⚡ Circuit'}
            {subject === 'physics' && currentGameType === 'hydraulic' && '💧 Hydraulic'}
            {subject === 'physics' && currentGameType === 'orbit' && '🌍 Orbit'}
            {subject !== 'physics' && currentGameType.toUpperCase()}
          </span>
          <span style={styles.levelBadge}>Level {currentLevel}/{maxLevel}</span>
        </div>
      </div>
      
      <GameComponent 
        difficulty={currentGameType}
        level={currentLevel}
        onComplete={handleComplete}
      />
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0d1117', padding: '20px' },
  gameHeader: { maxWidth: '800px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  exitBtn: { padding: '8px 16px', background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', color: '#fff', cursor: 'pointer' },
  gameInfo: { display: 'flex', gap: '15px', background: '#161b22', padding: '8px 20px', borderRadius: '12px', color: '#fff', flexWrap: 'wrap' },
  gameTypeBadge: { background: '#00c8ff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: '#fff' },
  levelBadge: { background: '#e94560', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' },
  resultCard: { maxWidth: '500px', margin: '100px auto', background: '#161b22', padding: '40px', borderRadius: '24px', textAlign: 'center', border: '2px solid' },
  resultEmoji: { fontSize: '64px', marginBottom: '16px' },
  scoreDisplay: { display: 'flex', justifyContent: 'center', alignItems: 'baseline', margin: '30px 0', gap: '10px' },
  scoreValue: { fontSize: '72px', fontWeight: 'bold', color: '#e94560' },
  scoreTotal: { fontSize: '32px', color: '#888' },
  perfectBadge: { color: '#4fc3f7', fontWeight: 'bold', marginTop: '10px', padding: '8px', background: 'rgba(79,195,247,0.1)', borderRadius: '20px' },
  levelComplete: { color: '#FAC775', fontWeight: 'bold', marginTop: '10px', padding: '8px', background: 'rgba(250,199,117,0.1)', borderRadius: '20px' },
  allComplete: { background: 'linear-gradient(135deg, #e94560, #FAC775)', padding: '15px', borderRadius: '12px', marginTop: '15px', color: '#fff', fontWeight: 'bold' },
  buttonGroup: { display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' },
  nextBtn: { padding: '12px 24px', background: '#238636', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '16px' },
  playAgainBtn: { padding: '12px 24px', background: '#4fc3f7', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '16px' },
  backBtn: { padding: '12px 24px', background: '#333', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '16px' },
  errorCard: { maxWidth: '400px', margin: '100px auto', background: '#161b22', padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#fff' }
};