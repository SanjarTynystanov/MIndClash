import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

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

const playRelief = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (error) {
    console.warn('playRelief failed', error);
  }
};

// ==================== FALLBACK ====================
const mathFallbackTemplates = {
  easy: [
    { q: '2x + 3 = 7', a: 2, solutionSteps: ['Subtract 3 from both sides', '2x = 4', 'Divide by 2', 'x = 2'], theory: { rule: 'Inverse operations solve linear equations', visual: '2x + 3 = 7 → 2x = 4 → x = 2' }, hintSteps: ['Subtract 3 first', 'Then divide by 2'] },
    { q: '5x - 4 = 11', a: 3, solutionSteps: ['Add 4 to both sides', '5x = 15', 'Divide by 5', 'x = 3'], theory: { rule: 'Balance the equation by doing same operations', visual: '5x - 4 = 11 → 5x = 15 → x = 3' }, hintSteps: ['Add 4 first', 'Keep equation balanced'] },
    { q: '3x + 2 = 14', a: 4, solutionSteps: ['Subtract 2', '3x = 12', 'Divide by 3', 'x = 4'], theory: { rule: 'Undo addition before division', visual: '3x + 2 = 14 → 3x = 12 → x = 4' }, hintSteps: ['Subtract the constant term', 'Then divide by coefficient'] },
    { q: 'x - 7 = 1', a: 8, solutionSteps: ['Add 7 to both sides', 'x = 8'], theory: { rule: 'Move constants to the other side', visual: 'x - 7 = 1 → x = 8' }, hintSteps: ['Add 7 to both sides'] },
    { q: '4x + 2 = 18', a: 4, solutionSteps: ['Subtract 2', '4x = 16', 'Divide by 4', 'x = 4'], theory: { rule: 'Use inverse operations', visual: '4x + 2 = 18 → 4x = 16 → x = 4' }, hintSteps: ['Remove the +2 first'] }
  ],
  medium: [
    { q: 'x / 2 + 3 = 7', a: 8, solutionSteps: ['Subtract 3', 'x / 2 = 4', 'Multiply by 2', 'x = 8'], theory: { rule: 'Undo division after subtraction', visual: 'x/2 + 3 = 7 → x/2 = 4 → x = 8' }, hintSteps: ['Remove the constant term first', 'Then multiply by 2'] },
    { q: '2x + 3 = 5x - 6', a: 3, solutionSteps: ['Bring x terms together', '3 = 3x - 6', 'Add 6', '9 = 3x', 'x = 3'], theory: { rule: 'Move variables one side', visual: '2x + 3 = 5x - 6 → 9 = 3x → x = 3' }, hintSteps: ['Move x terms to one side', 'Then isolate x'] },
    { q: '3x - 4 = 2x + 7', a: 11, solutionSteps: ['Subtract 2x', 'x - 4 = 7', 'Add 4', 'x = 11'], theory: { rule: 'Collect like terms', visual: '3x - 4 = 2x + 7 → x = 11' }, hintSteps: ['Remove 2x from both sides', 'Then add 4'] },
    { q: '4x + 7 = 3x + 14', a: 7, solutionSteps: ['Subtract 3x', 'x + 7 = 14', 'Subtract 7', 'x = 7'], theory: { rule: 'Simplify each side', visual: '4x + 7 = 3x + 14 → x = 7' }, hintSteps: ['Move x terms together first'] },
    { q: '6x - 5 = 2x + 11', a: 4, solutionSteps: ['Subtract 2x', '4x - 5 = 11', 'Add 5', '4x = 16', 'x = 4'], theory: { rule: 'Combine like terms before solving', visual: '6x - 5 = 2x + 11 → 4x = 16 → x = 4' }, hintSteps: ['Get x terms on one side', 'Then isolate x'] }
  ],
  hard: [
    { q: '3x / 2 + 4 = 10', a: 4, solutionSteps: ['Subtract 4', '3x / 2 = 6', 'Multiply by 2', '3x = 12', 'Divide by 3', 'x = 4'], theory: { rule: 'Work from outside in', visual: '3x/2 + 4 = 10 → 3x/2 = 6 → x = 4' }, hintSteps: ['Remove the constant', 'Then clear the fraction'] },
    { q: '5x / 3 - 2 = 8', a: 6, solutionSteps: ['Add 2', '5x / 3 = 10', 'Multiply by 3', '5x = 30', 'Divide by 5', 'x = 6'], theory: { rule: 'Undo subtraction then division', visual: '5x/3 - 2 = 8 → 5x/3 = 10 → x = 6' }, hintSteps: ['Add 2 first', 'Then multiply by 3'] },
    { q: '4x - 7 = 2x + 9', a: 8, solutionSteps: ['Subtract 2x', '2x - 7 = 9', 'Add 7', '2x = 16', 'x = 8'], theory: { rule: 'Collect variables then constants', visual: '4x - 7 = 2x + 9 → 2x = 16 → x = 8' }, hintSteps: ['Move x to one side', 'Then add 7'] },
    { q: '8x + 6 = 5x + 24', a: 6, solutionSteps: ['Subtract 5x', '3x + 6 = 24', 'Subtract 6', '3x = 18', 'x = 6'], theory: { rule: 'Simplify before isolating x', visual: '8x + 6 = 5x + 24 → 3x = 18 → x = 6' }, hintSteps: ['Remove 5x and constant terms first'] },
    { q: '2(x + 3) = 16', a: 5, solutionSteps: ['Divide by 2', 'x + 3 = 8', 'Subtract 3', 'x = 5'], theory: { rule: 'Apply inverse operations to both sides', visual: '2(x+3)=16 → x+3 = 8 → x = 5' }, hintSteps: ['Divide first', 'Then subtract 3'] }
  ]
};

const getFallbackData = (difficulty, level) => {
  const choices = mathFallbackTemplates[difficulty] || mathFallbackTemplates.medium;
  const index = ((level - 1) + Math.floor(Math.random() * choices.length)) % choices.length;
  const item = choices[index];
  return {
    ...item,
    difficultyName: difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Medium' : 'Hard',
    multiplier: difficulty === 'easy' ? 1.0 : difficulty === 'medium' ? 1.5 : 2.5,
    hintSteps: item.hintSteps || ['Think step by step', 'Use inverse operations']
  };
};

// ==================== ОСНОВНОЙ КОМПОНЕНТ ====================
export default function MathGame({ onComplete, level, difficulty: selectedDifficulty, onGameEnd }) {
  const [searchParams] = useSearchParams();
  const currentLevel = Math.min(parseInt(level) || 1, 10);
  const difficulty = selectedDifficulty || searchParams.get("difficulty") || "medium";
  
  const API_URL = import.meta.env.VITE_MATH_API_URL || 'http://localhost:8000/api/math';
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showTheory, setShowTheory] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wrongCount, setWrongCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [shake, setShake] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [wasCriticalWin, setWasCriticalWin] = useState(false);
  const [lastMultiplier, setLastMultiplier] = useState(1);
  
  const inputRef = useRef(null);
  const audioResumed = useRef(false);
  const tickIntervalRef = useRef(null);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/level/${currentLevel}?difficulty=${difficulty}&lang=en`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Math API failed with status ${res.status}`);
      }
      setCurrentQuestion(data);
    } catch (err) {
      console.error('Failed to load question:', err);
      setCurrentQuestion(getFallbackData(difficulty, currentLevel));
    }
    setLoading(false);
  }, [API_URL, currentLevel, difficulty]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const pulseEffect = timeLeft <= 5 && isTimerActive && !showExplanation;
  const glitchEffect = lives === 1 && !showExplanation;

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

  useEffect(() => {
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    tickIntervalRef.current = setInterval(() => {
      if (timeLeft <= 5 && timeLeft > 0 && isTimerActive && !showExplanation && lives > 0) {
        playTick(timeLeft);
      }
    }, 1000);
    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, [timeLeft, isTimerActive, showExplanation, lives]);

  useEffect(() => {
    if (!isTimerActive || showExplanation || lives <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerActive(false);
          playTimeout();
          setShake(true);
          setErrorFeedback("TIME'S UP!");
          const newLives = lives - 1;
          setLives(newLives);
          setCombo(0);
          setTimeout(() => setShake(false), 800);
          if (newLives <= 0) {
            setIsGameOver(true);
            if (onGameEnd) onGameEnd({ win: false, score });
          } else {
            setTimeout(() => {
              setTimeLeft(20);
              setIsTimerActive(true);
              setAnswer('');
              setErrorFeedback('');
            }, 1500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerActive, showExplanation, lives, score, onGameEnd]);

  useEffect(() => {
    if (!showExplanation && inputRef.current && lives > 0 && !isGameOver && !loading) {
      inputRef.current.focus();
    }
  }, [showExplanation, lives, isGameOver, loading]);

  const checkAnswer = () => {
    if (showExplanation || lives <= 0 || isGameOver || loading || !currentQuestion) return;
    const userAnswer = parseFloat(answer);
    const isCorrect = userAnswer === currentQuestion.a;
    
    const attemptsUsed = wrongCount + 1;
    
    if (isCorrect) {
      const newCombo = combo + 1;
      let comboBonus = Math.floor(newCombo / 3) * 20;
      let nerveBonus = 0;
      let wasCritical = false;
      
      if (timeLeft <= 3 && timeLeft > 0) {
        nerveBonus = 20;
        wasCritical = true;
        setWasCriticalWin(true);
        playRelief();
        setErrorFeedback("🎯 IRON NERVES! +20");
        setTimeout(() => setErrorFeedback(''), 1500);
      }
      
      const basePoints = 100;
      let attemptsPenalty = 0;
      if (attemptsUsed === 2) attemptsPenalty = 50;
      if (attemptsUsed === 3) attemptsPenalty = 75;
      
      let hintPenalty = 0;
      if (showHint && hintLevel > 0) hintPenalty = 10;
      
      const multiplier = currentQuestion.multiplier || 1;
      const totalMultiplier = multiplier + (wasCritical ? 0.2 : 0);
      
      let pointsEarned = Math.floor((basePoints - attemptsPenalty - hintPenalty) * totalMultiplier) + comboBonus + nerveBonus;
      pointsEarned = Math.max(pointsEarned, 10);
      
      let feedbackMessage = `✅ CORRECT! +${pointsEarned}`;
      if (attemptsUsed === 2) feedbackMessage += " (2nd attempt penalty)";
      if (attemptsUsed === 3) feedbackMessage += " (3rd attempt penalty)";
      if (showHint && hintLevel > 0) feedbackMessage += " (hint penalty)";
      if (wasCritical) feedbackMessage += " + IRON NERVES BONUS!";
      
      setErrorFeedback(feedbackMessage);
      setTimeout(() => setErrorFeedback(''), 2000);
      
      setCombo(newCombo);
      setScore(prev => prev + pointsEarned);
      setShowExplanation(true);
      setShowTheory(true);
      setIsTimerActive(false);
      playCorrect();
      setShake(true);
      setTimeout(() => setShake(false), 150);
      if (wasCritical) setTimeout(() => setWasCriticalWin(false), 2000);
      setLastMultiplier(totalMultiplier);
      
    } else {
      const penalty = 20;
      const newScore = Math.max(score - penalty, 0);
      setScore(newScore);
      setErrorFeedback(`❌ WRONG! -${penalty} points! Lives left: ${lives - 1}`);
      setTimeout(() => setErrorFeedback(''), 2000);
      
      const newWrongCount = wrongCount + 1;
      setWrongCount(newWrongCount);
      setCombo(0);
      const newLives = lives - 1;
      setLives(newLives);
      playError();
      setShake(true);
      setTimeout(() => setShake(false), 600);
      
      if (newWrongCount >= 2 && !showHint) {
        setShowHint(true);
        setHintLevel(1);
        setTimeLeft(prev => Math.max(prev - 5, 5));
      }
      if (newLives <= 0) {
        setIsGameOver(true);
        if (onGameEnd) onGameEnd({ win: false, score: newScore });
      } else {
        setTimeLeft(20);
        setIsTimerActive(true);
        setAnswer('');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showExplanation && lives > 0 && !isGameOver) {
      checkAnswer();
    }
  };

  const showNextHint = () => {
    if (hintLevel < currentQuestion.hintSteps.length) {
      setHintLevel(prev => prev + 1);
      setTimeLeft(prev => Math.max(prev - 5, 5));
    }
  };

  const handleRestart = () => {
    setIsGameOver(false);
    setScore(0);
    setLives(3);
    setCombo(0);
    setWrongCount(0);
    setAnswer('');
    setErrorFeedback('');
    setShowExplanation(false);
    setShowTheory(false);
    setShowHint(false);
    setHintLevel(0);
    setTimeLeft(20);
    setIsTimerActive(true);
    setWasCriticalWin(false);
    fetchQuestion();
  };

  const comboBonus = Math.floor(combo / 3) * 20;
  const timePercent = (timeLeft / 20) * 100;

  if (loading || !currentQuestion) {
    return <div style={styles.container}><div style={styles.loadingCard}>Loading task...</div></div>;
  }

  if (isGameOver) {
    return (
      <div style={styles.gameOverContainer}>
        <div style={styles.gameOverCard}>
          <div style={styles.gameOverEmoji}>💀⚡💀</div>
          <div style={styles.gameOverTitle}>[CRITICAL ERROR]</div>
          <div style={styles.gameOverCode}>MATH_MODULE COMPROMISED</div>
          <div style={styles.gameOverScore}>FINAL_SCORE: {score} pts</div>
          <div style={styles.gameOverMessage}>System overloaded. Rebooting module...</div>
          <button onClick={handleRestart} style={styles.gameOverBtn}>🔄 REBOOT SYSTEM</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, ...(glitchEffect && styles.glitchContainer) }}>
      <div style={{ ...styles.pulseBorder, ...(pulseEffect && styles.pulseBorderActive), ...(wasCriticalWin && styles.pulseBorderSuccess) }}>
        
        <div style={styles.topBar}>
          <div style={styles.livesContainer}>
            <span style={styles.livesLabel}>SYSTEM INTEGRITY:</span>
            <span style={styles.livesValue}>
              {Array(lives).fill('▮').join('')}{Array(3 - lives).fill('▯').join('')}
            </span>
          </div>
          <div style={styles.statBox}>⭐ {score}</div>
          {combo >= 3 && <div style={styles.comboBox}>🔥 x{Math.floor(combo / 3)}</div>}
          {currentQuestion.multiplier > 1 && <div style={styles.multiplierBadge}>x{currentQuestion.multiplier}</div>}
          <div style={{ ...styles.timerBox, ...(timeLeft <= 5 && styles.timerUrgent) }}>⏱️ {timeLeft}s</div>
        </div>

        <div style={styles.timerBar}>
          <div style={{ ...styles.timerFill, width: `${timePercent}%`, background: timeLeft <= 5 ? '#f85149' : '#e94560' }} />
        </div>

        {comboBonus > 0 && <div style={styles.comboBonus}>🔥 COMBO BONUS +{comboBonus}</div>}

        <div style={styles.levelBadge}>
          <span style={styles.levelBadgeText}>
            LEVEL {currentLevel}/10 | {difficulty === "easy" ? "🟢 Easy" : difficulty === "medium" ? "🟡 Medium" : "🔴 Hard"}
          </span>
        </div>

        <div style={{ ...styles.questionCard, ...(shake && styles.shake) }}>
          <div style={styles.questionHeader}>SOLVE THE EQUATION</div>
          <div style={styles.question}>{currentQuestion.q}</div>
          
          <div style={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="number"
              step="any"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="?"
              style={styles.input}
              disabled={showExplanation}
            />
          </div>
          
          <div style={styles.buttonRow}>
            {!showExplanation ? (
              <>
                <button onClick={checkAnswer} style={styles.checkBtn}>CHECK</button>
                <button onClick={showNextHint} style={{ ...styles.hintBtn, opacity: (!showHint && wrongCount < 2) ? 0.5 : 1 }} disabled={!showHint && wrongCount < 2}>
                  HINT
                </button>
              </>
            ) : null}
          </div>
          
          {!showHint && wrongCount < 2 && !showExplanation && lives > 0 && (
            <div style={styles.hintLocked}>🔒 Hint available after {2 - wrongCount} mistake(s)</div>
          )}
        </div>

        {showHint && !showExplanation && hintLevel > 0 && currentQuestion.hintSteps && (
          <div style={styles.hintBox}>
            <div style={styles.hintTitle}>💡 HINT {hintLevel}/{currentQuestion.hintSteps.length}</div>
            <div style={styles.hintText}>
              {typeof currentQuestion.hintSteps[hintLevel - 1] === 'object' 
                ? currentQuestion.hintSteps[hintLevel - 1].text 
                : currentQuestion.hintSteps[hintLevel - 1]}
            </div>
            {hintLevel < currentQuestion.hintSteps.length && <button onClick={showNextHint} style={styles.nextHintBtn}>MORE →</button>}
            <div style={styles.hintPenalty}>⚠️ Using hint costs 5 seconds</div>
          </div>
        )}

        {errorFeedback && !showExplanation && <div style={styles.errorBox}>⚠️ {errorFeedback}</div>}

        {showExplanation && showTheory && currentQuestion.solutionSteps && (
          <div style={styles.explainBox}>
            <div style={styles.explainHeader}>✅ CORRECT! +{(50 * lastMultiplier).toFixed(0)} {lastMultiplier > 1 && <span style={styles.multiplierText}>(x{lastMultiplier.toFixed(1)})</span>}</div>
            
            <div style={styles.theoryBox}>
              <div style={styles.theoryTitle}>📖 RULE</div>
              <div style={styles.theoryRule}>{currentQuestion.theory?.rule}</div>
              <div style={styles.theoryVisual}><code>{currentQuestion.theory?.visual}</code></div>
            </div>
            
            <div style={styles.solutionBox}>
              <div style={styles.solutionTitle}>📝 STEP-BY-STEP SOLUTION</div>
              {currentQuestion.solutionSteps.map((step, i) => (
                <div 
                  key={i} 
                  style={{ ...styles.solutionStep, ...(hoveredStep === i && styles.solutionStepHovered) }} 
                  onMouseEnter={() => setHoveredStep(i)} 
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {step}
                </div>
              ))}
            </div>

            <button onClick={() => {
              if (onComplete) onComplete({
                win: true,
                score,
                total: 1,
                perfect: wrongCount === 0 && !showHint,
                level: currentLevel,
                difficulty
              });
            }} style={styles.continueBtn}>
              CONTINUE →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px', background: '#0d1117', borderRadius: '20px', color: '#e6edf3', fontFamily: 'monospace', position: 'relative' },
  loadingCard: { textAlign: 'center', padding: '40px', color: '#8b949e' },
  glitchContainer: { animation: 'glitch 0.15s infinite' },
  pulseBorder: { transition: 'box-shadow 0.1s ease' },
  pulseBorderActive: { boxShadow: '0 0 0 2px #f85149, 0 0 0 4px rgba(248,81,73,0.3)', borderRadius: '20px', animation: 'pulseBorder 0.5s infinite' },
  pulseBorderSuccess: { boxShadow: '0 0 0 2px #238636, 0 0 0 4px rgba(35,134,54,0.3)', borderRadius: '20px', animation: 'pulseBorder 0.3s ease-out' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px 16px', background: '#161b22', borderRadius: '8px' },
  livesContainer: { display: 'flex', alignItems: 'center', gap: '8px', background: '#0d1117', padding: '4px 12px', borderRadius: '4px', border: '1px solid #30363d' },
  livesLabel: { fontSize: '10px', color: '#8b949e' },
  livesValue: { fontSize: '14px', color: '#f85149', letterSpacing: '2px' },
  statBox: { fontSize: '16px', fontWeight: 'bold', color: '#FAC775' },
  comboBox: { background: '#e94560', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  multiplierBadge: { background: '#e94560', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  timerBox: { fontSize: '18px', fontWeight: 'bold', color: '#FAC775' },
  timerUrgent: { color: '#f85149', animation: 'pulse 0.5s infinite' },
  timerBar: { height: '4px', background: '#30363d', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: '2px', transition: 'width 0.3s linear' },
  comboBonus: { textAlign: 'center', background: 'rgba(233,69,96,0.15)', padding: '8px', borderRadius: '8px', marginBottom: '16px', color: '#e94560', fontSize: '14px', fontWeight: 'bold' },
  levelBadge: { textAlign: 'center', marginBottom: '16px' },
  levelBadgeText: { background: 'rgba(233,69,96,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: '#e94560' },
  multiplierText: { fontSize: '14px', color: '#FAC775', marginLeft: '8px' },
  shake: { animation: 'shake 0.3s ease-in-out' },
  questionHeader: { fontSize: '12px', color: '#8b949e', marginBottom: '12px', letterSpacing: '1px' },
  question: { fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', fontFamily: 'monospace' },
  questionCard: { background: '#161b22', padding: '24px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 },
  inputWrapper: { display: 'flex', justifyContent: 'center', marginBottom: '20px', width: '100%', position: 'relative', zIndex: 10 },
  input: { width: '260px', minHeight: '60px', padding: '18px', fontSize: '32px', fontWeight: 'bold', background: '#262c34', border: '3px solid #e94560', borderRadius: '16px', color: '#ffffff', textAlign: 'center', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box', position: 'relative', zIndex: 9999, display: 'block', visibility: 'visible', opacity: 1, caretColor: '#e94560', boxShadow: '0 0 15px rgba(233,69,96,0.15)' },
  buttonRow: { display: 'flex', gap: '12px', justifyContent: 'center' },
  checkBtn: { background: '#238636', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  hintBtn: { background: '#1f6feb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  hintLocked: { textAlign: 'center', fontSize: '11px', color: '#6e7681', marginTop: '14px' },
  hintBox: { background: 'rgba(31,111,235,0.08)', border: '1px solid rgba(31,111,235,0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  hintTitle: { color: '#1f6feb', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' },
  hintText: { fontSize: '14px', marginBottom: '8px' },
  hintPenalty: { fontSize: '10px', color: '#f85149', marginTop: '8px' },
  nextHintBtn: { background: 'none', border: '1px solid #1f6feb', color: '#1f6feb', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
  errorBox: { background: 'rgba(216,90,48,0.1)', border: '1px solid #D85A30', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#F0997B', fontSize: '14px', textAlign: 'center' },
  explainBox: { background: '#161b22', border: '2px solid #238636', borderRadius: '12px', padding: '20px', marginTop: '20px' },
  explainHeader: { fontSize: '18px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#238636' },
  theoryBox: { marginBottom: '20px', padding: '16px', background: 'rgba(79,195,247,0.05)', borderRadius: '8px' },
  theoryTitle: { color: '#4fc3f7', marginBottom: '12px', fontSize: '13px', fontWeight: 'bold' },
  theoryRule: { fontSize: '15px', fontWeight: 'bold', color: '#FAC775', marginBottom: '12px' },
  theoryVisual: { background: '#0d1117', padding: '10px', borderRadius: '6px', marginBottom: '12px', textAlign: 'center', fontFamily: 'monospace', fontSize: '16px', color: '#e94560' },
  solutionBox: { padding: '16px', background: 'rgba(250,199,117,0.05)', borderRadius: '8px', marginBottom: '16px' },
  solutionTitle: { color: '#FAC775', marginBottom: '12px', fontSize: '13px', fontWeight: 'bold' },
  solutionStep: { padding: '8px 0', borderBottom: '1px solid #30363d', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' },
  solutionStepHovered: { color: '#FAC775', paddingLeft: '12px', borderLeft: '3px solid #FAC775' },
  continueBtn: { width: '100%', background: '#238636', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '16px' },
  gameOverContainer: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #1a0a0a 0%, #0d1117 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  gameOverCard: { textAlign: 'center', background: '#161b22', padding: '40px', borderRadius: '16px', border: '1px solid #f85149', boxShadow: '0 0 40px rgba(248,81,73,0.2)' },
  gameOverEmoji: { fontSize: '64px', marginBottom: '16px' },
  gameOverTitle: { fontSize: '24px', fontWeight: 'bold', color: '#f85149', marginBottom: '12px', fontFamily: 'monospace' },
  gameOverCode: { fontSize: '14px', color: '#FAC775', marginBottom: '12px', fontFamily: 'monospace' },
  gameOverScore: { fontSize: '18px', color: '#FAC775', marginBottom: '12px' },
  gameOverMessage: { fontSize: '12px', color: '#8b949e', marginBottom: '24px' },
  gameOverBtn: { background: '#238636', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake { 0%,100% { transform: translateX(0); } 15% { transform: translateX(-8px); } 30% { transform: translateX(8px); } 45% { transform: translateX(-6px); } 60% { transform: translateX(6px); } 75% { transform: translateX(-3px); } 90% { transform: translateX(3px); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes pulseBorder { 0%,100% { box-shadow: 0 0 0 0 rgba(248,81,73,0.4); } 50% { box-shadow: 0 0 0 4px rgba(248,81,73,0.6); } }
    @keyframes glitch { 0% { transform: translate(0); } 20% { transform: translate(-1px,1px); } 40% { transform: translate(-1px,-1px); } 60% { transform: translate(1px,1px); } 80% { transform: translate(1px,-1px); } 100% { transform: translate(0); } }
    input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
  `;
  document.head.appendChild(style);
}