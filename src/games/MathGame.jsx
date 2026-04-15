import { useState, useEffect, useCallback } from 'react';

// --- SOUND ENGINE (Web Audio API) ---
const playTone = (freq, type, duration) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch {
    // Удалили (e), так как мы его не используем
    console.log("Audio not supported or blocked");
  }
};

const playCorrectSound = () => playTone(600, 'sine', 0.4);
const playErrorSound = () => playTone(150, 'square', 0.3);
const playTickSound = () => playTone(400, 'sine', 0.05);

// --- GAME DATA ---
const TIME_LIMIT = 20;
const LEVELS = {
  1: [
    { q: "4x - (x + 2) = 10", a: 4, hint: "Expand brackets: 4x - x - 2 = 10" },
    { q: "x / 0.5 = 12", a: 6, hint: "Dividing by 0.5 is the same as multiplying by 2." },
    { q: "3² + x² = 25", a: 4, hint: "9 + x² = 25. Find the square root of 16." }
  ],
  2: [
    { q: "2^{x+1} = 32", a: 4, hint: "32 is 2 to the power of 5." },
    { q: "√(3x + 1) = 4", a: 5, hint: "Square both sides: 3x + 1 = 16." },
    { q: "x³ - 7 = 20", a: 3, hint: "x³ = 27. Cube root of 27 is 3." }
  ],
  3: [
    { q: "log₂(x) = 5", a: 32, hint: "Definition: 2 to the power of 5 is x." },
    { q: "5/(x-1) = 1", a: 6, hint: "Multiply by (x-1), so 5 = x - 1." },
    { q: "2x + 15 = 5x - 3", a: 6, hint: "Move x: 18 = 3x." }
  ],
  4: [
    { q: "sin²(45°) + cos²(45°) + x = 10", a: 9, hint: "Fundamental identity: sin²α + cos²α = 1." },
    { q: "f(x) = 2x - 5; f(x) = 11", a: 8, hint: "2x - 5 = 11, so 2x = 16." },
    { q: "x! = 120", a: 5, hint: "Factorial: 1 * 2 * 3 * 4 * 5 = 120." }
  ],
  5: [
    { q: "ln(eˣ) = 15", a: 15, hint: "Natural log property: ln(eˣ) is x." },
    { q: "x² - 5x + 6 = 0", a: 2, hint: "Roots are 2 and 3. Enter the smaller one." },
    { q: "2^{x} * 2³ = 64", a: 3, hint: "2^{x+3} = 2⁶, so x + 3 = 6." }
  ]
};

export default function MathGame({ level, onComplete, onGameOver }) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [lives, setLives] = useState(3);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [statusMsg, setStatusMsg] = useState('');

  const currentLevelData = LEVELS[level] || LEVELS[1];
  const currentQuestion = currentLevelData[step];

  const handleFailure = useCallback((msg) => {
    playErrorSound();
    setStatusMsg(msg);
    setLives((prev) => {
      const updatedLives = prev - 1;
      if (updatedLives <= 0) onGameOver?.();
      return updatedLives;
    });
    setAttempts((prev) => prev + 1);
    setAnswer('');
    setTimeLeft(TIME_LIMIT);
    
    if (attempts + 1 >= 2) setShowHint(true);
    setTimeout(() => setStatusMsg(''), 1500);
  }, [onGameOver, attempts]);

  // Main Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 6 && prev > 1) playTickSound();
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Watch for Time Out (FIXED LINTER ERROR)
  useEffect(() => {
    if (timeLeft === 0) {
      // Используем setTimeout, чтобы вынести обновление стейта из рендера
      const failTimer = setTimeout(() => {
        handleFailure("TIME'S UP! -1 ❤️");
      }, 0);
      return () => clearTimeout(failTimer);
    }
  }, [timeLeft, handleFailure]);

  const checkAnswer = useCallback(() => {
    if (parseFloat(answer) === currentQuestion.a) {
      playCorrectSound();
      setAnswer('');
      setAttempts(0);
      setShowHint(false);
      setTimeLeft(TIME_LIMIT);
      setStatusMsg('EXCELLENT! ✨');
      
      setTimeout(() => {
        setStatusMsg('');
        if (step < 2) {
          setStep(s => s + 1);
        } else {
          onComplete(true);
        }
      }, 1000);
    } else {
      handleFailure("WRONG! -1 ❤️");
    }
  }, [answer, currentQuestion, step, onComplete, handleFailure]);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.statBox}>
          <span style={styles.label}>HEALTH</span>
          <div style={styles.lives}>{"❤️".repeat(lives)}{"🖤".repeat(3 - lives)}</div>
        </div>
        <div style={styles.statBox}>
          <span style={styles.label}>PROGRESS</span>
          <div style={styles.stepCount}>STEP {step + 1} / 3</div>
        </div>
      </div>

      <div style={styles.timerWrapper}>
        <div 
          style={{
            ...styles.timerBar, 
            width: `${(timeLeft / TIME_LIMIT) * 100}%`,
            backgroundColor: timeLeft < 5 ? "#ff4d4d" : "#4ecca3"
          }} 
        />
      </div>

      <div style={styles.questionArea}>
        <h2 style={styles.equation}>{currentQuestion.q}</h2>
        {showHint && (
          <div style={styles.hintBox}>
            <strong>SYSTEM HINT:</strong> {currentQuestion.hint}
          </div>
        )}
      </div>

      <div style={styles.inputRow}>
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
          style={styles.input}
          placeholder="?"
          autoFocus
        />
        <button onClick={checkAnswer} style={styles.submitBtn}>SUBMIT</button>
      </div>

      <div style={styles.feedbackArea}>
        {statusMsg && <div style={styles.statusText}>{statusMsg}</div>}
      </div>
    </div>
  );
}

const styles = {
  card: { background: "#0a0a1a", padding: "35px", borderRadius: "20px", textAlign: "center", border: "1px solid #1a1a2e", maxWidth: "450px", margin: "0 auto", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  statBox: { textAlign: "left" },
  label: { fontSize: "10px", color: "#444", fontWeight: "bold", letterSpacing: "1px" },
  lives: { fontSize: "18px", marginTop: "5px" },
  stepCount: { color: "#fff", fontWeight: "bold", fontSize: "18px", marginTop: "5px" },
  timerWrapper: { width: "100%", height: "4px", background: "#111", borderRadius: "2px", marginBottom: "35px" },
  timerBar: { height: "100%", transition: "width 1s linear, background-color 0.3s", borderRadius: "2px" },
  questionArea: { marginBottom: "30px", minHeight: "130px", display: "flex", flexDirection: "column", justifyContent: "center" },
  equation: { color: "#fff", fontSize: "42px", margin: 0, fontWeight: "300", letterSpacing: "3px" },
  hintBox: { marginTop: "20px", color: "#e94560", fontSize: "13px", background: "rgba(233, 69, 96, 0.05)", padding: "12px", borderRadius: "10px", border: "1px dashed #333" },
  inputRow: { display: "flex", gap: "12px", justifyContent: "center" },
  input: { background: "#000", border: "1px solid #222", color: "#fff", padding: "15px", borderRadius: "12px", fontSize: "22px", width: "110px", textAlign: "center", outline: "none" },
  submitBtn: { background: "#e94560", color: "#fff", border: "none", padding: "0 30px", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" },
  feedbackArea: { height: "40px", marginTop: "20px" },
  statusText: { color: "#4ecca3", fontWeight: "bold", fontSize: "14px", letterSpacing: "1px" }
};