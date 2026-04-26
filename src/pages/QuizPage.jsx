import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function QuizPage() {
  const { subject, difficulty } = useParams();
  const navigate = useNavigate();
  const { user, token, updateGameProgress, fetchProfile } = useContext(AppContext);
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [perfectGame, setPerfectGame] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [lives, setLives] = useState(3);
  const [timeWarning, setTimeWarning] = useState(false);
  const timerRef = useRef(null);

  const API_URL = 'http://localhost:3001';

  // Сначала объявляем handleTimeOut
  const handleTimeOut = useCallback(() => {
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameCompleted(true);
        return 0;
      }
      setFeedback('⏰ Time out! -1 life');
      setTimeout(() => setFeedback(''), 1500);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        startTimer();
      }
      return newLives;
    });
  }, []);

  // Затем объявляем startTimer
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(20);
    setTimeWarning(false);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev <= 6) setTimeWarning(true);
        return prev - 1;
      });
    }, 1000);
  }, [handleTimeOut]);

  // Затем loadQuestions
  const loadQuestions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/quiz/questions/${difficulty}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
      } else {
        // Fallback вопросы
        setQuestions([
          { id: 1, question: 'Sample question?', options: ['A', 'B', 'C', 'D'], correct: 0 }
        ]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load questions:', error);
      setLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    loadQuestions();
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [loadQuestions, startTimer]);

  const handleAnswer = useCallback(async (answerIndex) => {
    if (answered) return;
    
    const question = questions[currentQuestion];
    
    try {
      const res = await fetch(`${API_URL}/api/quiz/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.id,
          answer: answerIndex,
          difficulty: difficulty
        })
      });
      
      const result = await res.json();
      
      if (result.correct) {
        setScore(prev => prev + 1);
        setFeedback('✓ Correct!');
      } else {
        setPerfectGame(false);
        setFeedback(`✗ Wrong! Correct: ${result.correct_answer}`);
      }
      
      setAnswered(true);
      
      const isLastQuestion = currentQuestion + 1 >= questions.length;
      
      if (isLastQuestion) {
        const finalScore = score + (result.correct ? 1 : 0);
        const win = finalScore >= 7;
        const perfect = perfectGame && result.correct && finalScore === questions.length;
        
        clearInterval(timerRef.current);
        
        if (token && user) {
          await updateGameProgress(subject, difficulty, win, perfect);
          await fetchProfile();
        }
        
        setGameCompleted(true);
      } else {
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          setAnswered(false);
          setFeedback('');
          startTimer();
        }, 1500);
      }
    } catch (error) {
      console.error('Error checking answer:', error);
    }
  }, [answered, questions, currentQuestion, difficulty, score, perfectGame, token, user, updateGameProgress, fetchProfile, startTimer]);

  if (loading) return <div style={styles.loading}>Loading questions...</div>;

  if (gameCompleted) {
    const win = score >= 7;
    const percent = Math.round((score / questions.length) * 100);
    
    return (
      <div style={styles.container}>
        <div style={styles.resultCard}>
          <h1 style={{ color: win ? '#4fc3f7' : '#e94560' }}>
            {win ? '🎉 VICTORY!' : '😔 GAME OVER'}
          </h1>
          <div style={styles.scoreDisplay}>
            <div style={styles.scoreValue}>{score}</div>
            <div style={styles.scoreTotal}>/{questions.length}</div>
          </div>
          <p>Accuracy: {percent}%</p>
          {perfectGame && score === questions.length && (
            <p style={styles.perfectBadge}>💯 PERFECT GAME! +5 bonus XP</p>
          )}
          <div style={styles.buttonGroup}>
            <button style={styles.playAgainBtn} onClick={() => window.location.reload()}>
              Play Again
            </button>
            <button style={styles.homeBtn} onClick={() => navigate(`/subject/${subject}`)}>
              Back to {subject}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return <div style={styles.loading}>No questions available</div>;
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const timerPercent = (timeLeft / 20) * 100;
  const livesDisplay = '▮'.repeat(lives) + '▯'.repeat(3 - lives);

  return (
    <div style={styles.container}>
      <div style={styles.statsBar}>
        <div style={styles.statGroup}>
          <span style={styles.statLabel}>SYSTEM INTEGRITY:</span>
          <span style={styles.statValue}>{livesDisplay}</span>
        </div>
        <div style={styles.statGroup}>
          <span style={styles.statLabel}>⭐</span>
          <span style={styles.statValue}>{score}</span>
        </div>
        <div style={{ ...styles.statGroup, ...(timeWarning && styles.timerWarning) }}>
          <span style={styles.statLabel}>⏱️</span>
          <span style={styles.statValue}>{timeLeft}s</span>
        </div>
      </div>

      <div style={styles.timerBar}>
        <div style={{ ...styles.timerFill, width: `${timerPercent}%`, background: timeLeft <= 5 ? '#f85149' : '#e94560' }} />
      </div>

      {timeWarning && <div style={styles.redFlash} />}

      <div style={styles.questionCard}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        
        <h2 style={styles.question}>{question.question}</h2>
        
        <div style={styles.optionsGrid}>
          {question.options.map((option, idx) => (
            <button
              key={idx}
              style={{ ...styles.optionBtn, ...(answered && idx === question.correct && styles.correctOption) }}
              onClick={() => handleAnswer(idx)}
              disabled={answered}
            >
              {option}
            </button>
          ))}
        </div>
        
        {feedback && <div style={styles.feedback}>{feedback}</div>}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a1a', padding: '40px 20px' },
  loading: { textAlign: 'center', color: '#888', padding: '40px' },
  statsBar: { maxWidth: '800px', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', padding: '12px 20px', background: '#1a1a2e', borderRadius: '12px' },
  statGroup: { display: 'flex', alignItems: 'center', gap: '8px', color: '#FAC775' },
  statLabel: { color: '#888' },
  statValue: { color: '#FAC775', fontWeight: 'bold' },
  timerWarning: { animation: 'pulse 0.5s infinite' },
  timerBar: { maxWidth: '800px', margin: '0 auto 20px', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' },
  timerFill: { height: '100%', transition: 'width 0.3s linear' },
  redFlash: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(233,69,96,0.2)', pointerEvents: 'none', zIndex: 10, animation: 'flash 0.5s infinite' },
  questionCard: { maxWidth: '800px', margin: '0 auto', background: '#1a1a2e', padding: '30px', borderRadius: '20px' },
  progressBar: { height: '6px', background: '#333', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #e94560, #FAC775)', transition: 'width 0.3s' },
  question: { color: '#fff', fontSize: '28px', marginBottom: '30px', textAlign: 'center' },
  optionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' },
  optionBtn: { padding: '15px', background: '#0a0a1a', border: '1px solid #333', borderRadius: '10px', color: '#fff', fontSize: '16px', cursor: 'pointer' },
  correctOption: { background: '#238636', borderColor: '#4fc3f7' },
  feedback: { marginTop: '20px', padding: '10px', background: 'rgba(233,69,96,0.2)', borderRadius: '8px', color: '#FAC775', textAlign: 'center' },
  resultCard: { maxWidth: '500px', margin: '100px auto', background: '#1a1a2e', padding: '40px', borderRadius: '20px', textAlign: 'center' },
  scoreDisplay: { display: 'flex', justifyContent: 'center', alignItems: 'baseline', margin: '30px 0', gap: '10px' },
  scoreValue: { fontSize: '72px', fontWeight: 'bold', color: '#e94560' },
  scoreTotal: { fontSize: '32px', color: '#888' },
  perfectBadge: { color: '#4fc3f7', fontWeight: 'bold', marginTop: '10px' },
  buttonGroup: { display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' },
  playAgainBtn: { padding: '12px 24px', background: '#4fc3f7', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' },
  homeBtn: { padding: '12px 24px', background: '#333', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes flash { 0%,100% { opacity: 0; } 50% { opacity: 1; } }
  `;
  document.head.appendChild(style);
}