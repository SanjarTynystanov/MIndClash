import { useState, useEffect, useRef, useCallback } from 'react';

// ==================== ЗВУКИ ====================
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

const playTick = (secondsLeft) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const frequency = 400 + (6 - secondsLeft) * 80;
    osc.type = 'sawtooth';
    osc.frequency.value = Math.min(frequency, 900);
    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (error) {
    console.warn('playTick failed', error);
  }
};

const playTimeout = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 1);
    gain.gain.setValueAtTime(0.9, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1);
  } catch (error) {
    console.warn('playTimeout failed', error);
  }
};

const playCorrect = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.5;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  } catch (error) {
    console.warn('playCorrect failed', error);
  }
};

const playError = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 220;
    gain.gain.value = 0.7;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.stop(ctx.currentTime + 0.4);
  } catch (error) {
    console.warn('playError failed', error);
  }
};

export default function ChemistryGame({ difficulty, level, onComplete }) {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(20);
  const [lives, setLives] = useState(3);
  const [selectedAtoms, setSelectedAtoms] = useState([]);
  const timerRef = useRef(null);
  const [shake, setShake] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [streak, setStreak] = useState(0);
  const [timeWarning, setTimeWarning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const audioResumed = useRef(false);

  // Resume audio on first click
  useEffect(() => {
    const resumeAudio = () => {
      if (!audioResumed.current) {
        getAudioContext().resume();
        audioResumed.current = true;
      }
    };
    document.addEventListener('click', resumeAudio);
    return () => document.removeEventListener('click', resumeAudio);
  }, []);

  const loadChallenge = useCallback(async () => {
    setLoading(true);
    try {
     const res = await fetch(`http://localhost:3001/api/chemistry/game/${difficulty}/${level}`);
      if (res.ok) {
        const data = await res.json();
        setChallenge(data);
        setTimeLeft(20);
        setSelectedAtoms([]);
        setFeedback('');
        setTimeWarning(false);
        setShowHint(false);
        setWrongCount(0);
        setShowExplanation(false);
      } else {
        console.error('Failed to load challenge');
      }
    } catch (error) {
      console.error('Failed to load challenge:', error);
    } finally {
      setLoading(false);
    }
  }, [difficulty, level]);

  // Timer effect
  useEffect(() => {
    if (showExplanation || isGameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        if (newTime <= 5 && newTime > 0) {
          playTick(newTime);
          setTimeWarning(true);
        } else if (newTime > 5) {
          setTimeWarning(false);
        }
        
        if (newTime <= 0) {
          clearInterval(timer);
          playTimeout();
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setFeedback('⏰ TIME\'S UP! -1 life');
          
          setLives(prevLives => {
            const newLives = prevLives - 1;
            setStreak(0);
            setMultiplier(1);
            
            if (newLives <= 0) {
              setIsGameOver(true);
              onComplete({ success: false, score });
            } else {
              setTimeout(() => {
                setTimeLeft(20);
                setFeedback('');
                loadChallenge();
              }, 1500);
            }
            return newLives;
          });
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showExplanation, isGameOver, score, onComplete, loadChallenge]);

  const normalizeFormula = (formula) => {
    if (!formula) return '';
    return formula.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (match) => {
      const subscripts = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
      return subscripts[match] || match;
    });
  };

  const handleBuilderAnswer = async () => {
    if (showExplanation) return;
    
    const formula = selectedAtoms.map(a => a.count > 1 ? a.symbol + a.count : a.symbol).join('');
    const normalizedFormula = normalizeFormula(formula);
    const normalizedCorrect = normalizeFormula(challenge?.data?.formula || '');
    
    const isCorrect = normalizedFormula === normalizedCorrect;
    
    if (isCorrect) {
      playCorrect();
      const newStreak = streak + 1;
      const newMultiplier = Math.min(1.5 + Math.floor(newStreak / 3) * 0.3, 3);
      setStreak(newStreak);
      setMultiplier(newMultiplier);
      const pointsEarned = Math.floor(100 * newMultiplier);
      setScore(prev => prev + pointsEarned);
      setFeedback(`✅ CORRECT! +${pointsEarned} points`);
      setShowExplanation(true);
      
      setTimeout(() => {
        onComplete({ 
          success: true, 
          score: pointsEarned, 
          xp: Math.floor(20 * newMultiplier),
          streak: newStreak
        });
      }, 1500);
    } else {
      playError();
      const newWrongCount = wrongCount + 1;
      setWrongCount(newWrongCount);
      setStreak(0);
      setMultiplier(1);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setFeedback(`❌ WRONG! Correct: ${challenge?.data?.formula || 'Unknown'}`);
      
      if (newWrongCount >= 2 && !showHint) {
        setShowHint(true);
      }
      
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        setIsGameOver(true);
        onComplete({ success: false, score });
      }
    }
  };

  const addAtom = (symbol) => {
    const existing = selectedAtoms.find(a => a.symbol === symbol);
    if (existing) {
      setSelectedAtoms(selectedAtoms.map(a => 
        a.symbol === symbol ? { ...a, count: a.count + 1 } : a
      ));
    } else {
      setSelectedAtoms([...selectedAtoms, { symbol, count: 1 }]);
    }
  };

  const removeLastAtom = () => {
    setSelectedAtoms(selectedAtoms.slice(0, -1));
  };

  if (loading) return <div style={styles.loading}>🧪 Loading chemistry challenge...</div>;

  if (isGameOver) {
    return (
      <div style={styles.gameOverContainer}>
        <div style={styles.gameOverCard}>
          <div style={styles.gameOverEmoji}>💀⚗️💀</div>
          <div style={styles.gameOverTitle}>[SYSTEM FAILURE]</div>
          <div style={styles.gameOverCode}>CHEMISTRY_MODULE_DAMAGED</div>
          <div style={styles.gameOverScore}>FINAL_SCORE: {score} pts</div>
          <button onClick={() => window.location.reload()} style={styles.gameOverBtn}>🔄 RESTART</button>
        </div>
      </div>
    );
  }

  const renderLives = () => {
    const full = '▮'.repeat(lives);
    const empty = '▯'.repeat(3 - lives);
    return full + empty;
  };

  const timerPercent = (timeLeft / 20) * 100;
  const pulseEffect = timeLeft <= 5 && !showExplanation;

  return (
    <div style={{ ...styles.container, ...(pulseEffect && styles.pulseBorder) }}>
      <div style={styles.topBar}>
        <div style={styles.livesContainer}>
          <span style={styles.livesLabel}>SYSTEM INTEGRITY:</span>
          <span style={styles.livesValue}>{renderLives()}</span>
        </div>
        <div style={styles.statBox}>⭐ {score}</div>
        {multiplier > 1 && <div style={styles.multiplierBadge}>x{multiplier.toFixed(1)}</div>}
        <div style={{ ...styles.timerBox, ...(timeLeft <= 5 && styles.timerUrgent) }}>⏱️ {timeLeft}s</div>
      </div>

      <div style={styles.timerBar}>
        <div style={{ ...styles.timerFill, width: `${timerPercent}%`, background: timeLeft <= 5 ? '#f85149' : '#e94560' }} />
      </div>

      {timeWarning && <div style={styles.redFlash} />}

      <div style={{ ...styles.questionCard, ...(shake && styles.shake) }}>
        <div style={styles.flask}>
          <div style={styles.flaskNeck} />
          <div style={styles.flaskBody}>
            <div style={styles.flaskLiquid}>
              {selectedAtoms.length === 0 ? (
                <span style={styles.emptyFlaskText}>🧪</span>
              ) : (
                selectedAtoms.map((atom, idx) => (
                  <span key={idx} style={styles.atomInFlask}>
                    {atom.symbol}{atom.count > 1 && atom.count}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
        
        <h2 style={styles.target}>Build: {challenge?.data?.name}</h2>
        <p style={styles.fact}>{challenge?.data?.fact}</p>
        
        <div style={styles.atomsPalette}>
          {challenge?.data?.components?.map(([symbol]) => (
            <button key={symbol} style={styles.atomBtn} onClick={() => addAtom(symbol)}>
              {challenge?.elements?.[symbol]?.emoji || symbol} {symbol}
            </button>
          ))}
        </div>
        
        <div style={styles.builtMolecule}>
          <strong>Current:</strong> {selectedAtoms.map(a => a.symbol + (a.count > 1 ? a.count : '')).join('') || 'Empty'}
        </div>
        
        <div style={styles.buttonRow}>
          <button style={styles.clearBtn} onClick={removeLastAtom}>⌫ Clear</button>
          <button style={styles.checkBtn} onClick={handleBuilderAnswer}>✓ CHECK</button>
        </div>

        {showHint && !showExplanation && (
          <div style={styles.hintBox}>
            💡 Hint: Try counting the atoms! Make sure both sides have the same number.
          </div>
        )}

        {feedback && <div style={styles.feedback}>{feedback}</div>}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px', background: '#0d1117', borderRadius: '20px', color: '#e6edf3', fontFamily: 'monospace', position: 'relative' },
  loading: { textAlign: 'center', padding: '40px', color: '#8b949e' },
  pulseBorder: { animation: 'pulseBorder 0.5s infinite', borderRadius: '20px' },
  shake: { animation: 'shake 0.3s ease-in-out' },
  
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '12px 16px', background: '#161b22', borderRadius: '8px' },
  livesContainer: { display: 'flex', alignItems: 'center', gap: '8px', background: '#0d1117', padding: '4px 12px', borderRadius: '4px', border: '1px solid #30363d' },
  livesLabel: { fontSize: '10px', color: '#8b949e' },
  livesValue: { fontSize: '14px', color: '#f85149', letterSpacing: '2px' },
  statBox: { fontSize: '16px', fontWeight: 'bold', color: '#FAC775' },
  multiplierBadge: { background: '#e94560', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  timerBox: { fontSize: '18px', fontWeight: 'bold', color: '#FAC775' },
  timerUrgent: { color: '#f85149', animation: 'pulse 0.5s infinite' },
  
  timerBar: { height: '4px', background: '#30363d', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: '2px', transition: 'width 0.3s linear' },
  
  redFlash: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(248,81,73,0.15)', pointerEvents: 'none', zIndex: 10, animation: 'flash 0.5s infinite' },
  
  questionCard: { background: '#161b22', padding: '24px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', position: 'relative', zIndex: 1 },
  
  flask: { width: '200px', margin: '0 auto 20px', position: 'relative' },
  flaskNeck: { width: '40px', height: '30px', background: 'rgba(255,255,255,0.05)', border: '2px solid #30363d', borderBottom: 'none', borderRadius: '8px 8px 0 0', margin: '0 auto' },
  flaskBody: { width: '140px', height: '140px', background: 'rgba(255,255,255,0.03)', border: '2px solid #30363d', borderRadius: '0 0 70px 70px', margin: '0 auto', position: 'relative', overflow: 'hidden' },
  flaskLiquid: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg, #4fc3f7, #2196f3)', minHeight: '80px', padding: '10px', textAlign: 'center' },
  emptyFlaskText: { fontSize: '40px', opacity: 0.5 },
  atomInFlask: { display: 'inline-block', margin: '3px', padding: '3px 6px', background: '#fff', borderRadius: '12px', color: '#333', fontSize: '11px' },
  
  target: { fontSize: '24px', color: '#fff', marginBottom: '8px' },
  fact: { fontSize: '13px', color: '#8b949e', marginBottom: '20px' },
  
  atomsPalette: { display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  atomBtn: { padding: '8px 16px', background: '#238636', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '14px' },
  builtMolecule: { marginBottom: '20px', padding: '10px', background: '#0d1117', borderRadius: '8px', color: '#FAC775' },
  
  buttonRow: { display: 'flex', gap: '12px', justifyContent: 'center' },
  clearBtn: { background: '#30363d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' },
  checkBtn: { background: '#238636', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  
  hintBox: { background: 'rgba(31,111,235,0.1)', border: '1px solid #1f6feb', borderRadius: '8px', padding: '10px', marginTop: '15px', fontSize: '12px', color: '#1f6feb' },
  feedback: { marginTop: '15px', padding: '10px', background: 'rgba(248,81,73,0.1)', borderRadius: '8px', color: '#f85149', fontSize: '13px' },
  
  gameOverContainer: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #1a0a0a 0%, #0d1117 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  gameOverCard: { textAlign: 'center', background: '#161b22', padding: '40px', borderRadius: '16px', border: '1px solid #f85149' },
  gameOverEmoji: { fontSize: '64px', marginBottom: '16px' },
  gameOverTitle: { fontSize: '24px', fontWeight: 'bold', color: '#f85149', marginBottom: '12px' },
  gameOverCode: { fontSize: '14px', color: '#FAC775', marginBottom: '12px' },
  gameOverScore: { fontSize: '18px', color: '#FAC775', marginBottom: '24px' },
  gameOverBtn: { background: '#238636', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '8px', cursor: 'pointer' }
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake { 0%,100% { transform: translateX(0); } 15% { transform: translateX(-8px); } 30% { transform: translateX(8px); } 45% { transform: translateX(-6px); } 60% { transform: translateX(6px); } 75% { transform: translateX(-3px); } 90% { transform: translateX(3px); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes pulseBorder { 0%,100% { box-shadow: 0 0 0 0 rgba(248,81,73,0.4); } 50% { box-shadow: 0 0 0 4px rgba(248,81,73,0.6); } }
    @keyframes flash { 0%,100% { opacity: 0; } 50% { opacity: 1; } }
  `;
  document.head.appendChild(style);
}