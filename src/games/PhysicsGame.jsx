import { useState, useEffect } from 'react';
import CannonLevel from './levels/CannonLevel';
import OpticsLevel from './levels/OpticsLevel';

export default function PhysicsGame({ difficulty, level, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [gameType, setGameType] = useState('cannon');
  const currentLevel = parseInt(level) || 1;

  useEffect(() => {
    const type = (difficulty || 'cannon').toLowerCase();
    console.log("🔧 PhysicsGame - difficulty:", difficulty, "-> gameType:", type);
    setGameType(type);
    setLoading(false);
  }, [difficulty]);

  if (loading) {
    return <div style={styles.loading}>⚛️ Loading physics module...</div>;
  }

  console.log("🎮 PhysicsGame - rendering:", gameType);

  switch (gameType) {
    case 'cannon':
      return <CannonLevel level={currentLevel} onComplete={onComplete} />;
    case 'optics':
      return <OpticsLevel level={currentLevel} onComplete={onComplete} />;
    case 'circuit':
      return <div style={styles.comingSoon}>⚡ Circuit Level {currentLevel} - Coming Soon!</div>;
    case 'hydraulic':
      return <div style={styles.comingSoon}>💧 Hydraulic Level {currentLevel} - Coming Soon!</div>;
    case 'orbit':
      return <div style={styles.comingSoon}>🌍 Orbit Level {currentLevel} - Coming Soon!</div>;
    default:
      return <CannonLevel level={currentLevel} onComplete={onComplete} />;
  }
}

const styles = {
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#888',
    fontSize: '18px'
  },
  comingSoon: {
    textAlign: 'center',
    padding: '60px',
    color: '#00c8ff',
    fontSize: '24px',
    fontFamily: 'monospace'
  }
};