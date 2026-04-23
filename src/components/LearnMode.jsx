// LearnMode.jsx
import { useState } from 'react';

export default function LearnMode({ topic, theory, examples, onStart }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showExamples, setShowExamples] = useState(false);

  if (showExamples) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>📚 Примеры</div>
        {examples.map((ex, i) => (
          <div key={i} style={styles.exampleCard}>
            <div style={styles.exampleQuestion}>📌 {ex.question}</div>
            <div style={styles.exampleSolution}>→ {ex.solution}</div>
            <div style={styles.exampleExplanation}>{ex.explanation}</div>
          </div>
        ))}
        <button onClick={onStart} style={styles.startBtn}>
          🎮 Начать игру →
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>📖 Изучаем тему: {topic}</div>
      <div style={styles.content}>
        <div style={styles.slide}>
          <div style={styles.theory}>{theory[currentSlide]}</div>
        </div>
        <div style={styles.navigation}>
          <button 
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            style={styles.navBtn}
          >
            ← Назад
          </button>
          {currentSlide < theory.length - 1 ? (
            <button 
              onClick={() => setCurrentSlide(prev => prev + 1)}
              style={styles.navBtn}
            >
              Далее →
            </button>
          ) : (
            <button 
              onClick={() => setShowExamples(true)}
              style={styles.navBtn}
            >
              📝 К примерам →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px',
    background: '#0d1117',
    borderRadius: '16px',
  },
  header: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: '24px',
  },
  content: {
    minHeight: '300px',
  },
  slide: {
    background: '#161b22',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  theory: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: '#e6edf3',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  navBtn: {
    background: '#1f6feb',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  exampleCard: {
    background: '#161b22',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  exampleQuestion: {
    color: '#FAC775',
    marginBottom: '8px',
  },
  exampleSolution: {
    color: '#5DCAA5',
    marginBottom: '4px',
  },
  exampleExplanation: {
    fontSize: '12px',
    color: '#888',
  },
  startBtn: {
    width: '100%',
    background: '#238636',
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};