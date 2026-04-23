import { useState, useEffect, useRef } from 'react';

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
  } catch (err) {
    // Игнорируем ошибки аудио
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
  } catch (err) {
    // Игнорируем ошибки аудио
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
  } catch (err) {
    // Игнорируем ошибки аудио
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
  } catch (err) {
    // Игнорируем ошибки аудио
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
  } catch (err) {
    // Игнорируем ошибки аудио
  }
};

// ==================== 10 УРОВНЕЙ ====================
const getQuestionData = (level) => {
  const questionsData = {
    1: {
      q: "4x - (x + 2) = 10",
      a: 4,
      example: {
        text: "3x - (x + 1) = 5",
        answer: 3,
        steps: [
          "Раскрываем скобки: 3x - x - 1 = 5",
          "Упрощаем: 2x - 1 = 5",
          "Переносим -1: 2x = 6",
          "Делим на 2: x = 3"
        ],
        explanation: "Минус перед скобкой меняет знак у x (+ → -) и у 1 (+ → -)"
      },
      solutionSteps: [
        "1️⃣ Раскрываем скобки: 4x - x - 2 = 10",
        "2️⃣ Упрощаем: 3x - 2 = 10",
        "3️⃣ Переносим -2: 3x = 12",
        "4️⃣ Делим на 3: x = 4"
      ],
      theory: {
        rule: "Минус перед скобкой меняет знаки ВСЕХ слагаемых внутри",
        visual: "-(x + 2) = -x - 2",
        explanation: "Когда перед скобкой стоит знак минус, каждый знак внутри меняется на противоположный.\n\n• Было +x → стало -x\n• Было +2 → стало -2",
        formula: "4x - (x + 2) = 4x - x - 2 = 3x - 2"
      },
      hintSteps: ["Раскрой скобки (меняем знаки)", "4x - x - 2 = 10", "3x = 12", "x = 4"]
    },
    2: {
      q: "2x² = 32",
      a: 4,
      example: {
        text: "3x² = 27",
        answer: 3,
        steps: [
          "Делим обе части на 3: x² = 9",
          "Извлекаем корень: x = 3"
        ],
        explanation: "Чтобы найти x, делим на коэффициент, затем извлекаем корень."
      },
      solutionSteps: [
        "1️⃣ Делим обе части на 2: x² = 16",
        "2️⃣ Извлекаем корень: x = 4"
      ],
      theory: {
        rule: "x² = a → x = √a (a > 0)",
        visual: "x² = 16 → x = √16 = 4",
        explanation: "Чтобы найти x, нужно извлечь квадратный корень из правой части.\n\n• √16 = 4, потому что 4² = 16",
        formula: "2x² = 32 → x² = 16 → x = 4"
      },
      hintSteps: ["Подели на 2", "x² = 16", "x = 4"]
    },
    3: {
      q: "x/3 + 2 = 7",
      a: 15,
      example: {
        text: "x/2 + 3 = 8",
        answer: 10,
        steps: [
          "Вычитаем 3: x/2 = 5",
          "Умножаем на 2: x = 10"
        ],
        explanation: "Сначала переносим константу, затем умножаем на знаменатель."
      },
      solutionSteps: [
        "1️⃣ Вычитаем 2: x/3 = 5",
        "2️⃣ Умножаем на 3: x = 15"
      ],
      theory: {
        rule: "Дробь = число → умножаем на знаменатель",
        visual: "x/3 = 5 → x = 15",
        explanation: "Чтобы избавиться от дроби, умножаем обе части на знаменатель.",
        formula: "x/3 + 2 = 7 → x/3 = 5 → x = 15"
      },
      hintSteps: ["Перенеси 2", "x/3 = 5", "x = 15"]
    },
    4: {
      q: "(x + 4)/2 = 9",
      a: 14,
      example: {
        text: "(x + 2)/3 = 5",
        answer: 13,
        steps: [
          "Умножаем на 3: x + 2 = 15",
          "Вычитаем 2: x = 13"
        ],
        explanation: "Сначала умножаем на знаменатель, затем переносим число."
      },
      solutionSteps: [
        "1️⃣ Умножаем на 2: x + 4 = 18",
        "2️⃣ Вычитаем 4: x = 14"
      ],
      theory: {
        rule: "Дробь = число: (x + a)/b = c → x + a = c·b",
        visual: "(x + 4)/2 = 9 → x + 4 = 18",
        explanation: "Умножаем обе части на знаменатель, затем находим x.",
        formula: "(x + 4)/2 = 9 → x + 4 = 18 → x = 14"
      },
      hintSteps: ["Умножь на 2", "x + 4 = 18", "x = 14"]
    },
    5: {
      q: "3x - (2x - 5) = 14",
      a: 9,
      example: {
        text: "5x - (3x - 2) = 10",
        answer: 4,
        steps: [
          "Раскрываем скобки: 5x - 3x + 2 = 10",
          "Упрощаем: 2x + 2 = 10",
          "Вычитаем 2: 2x = 8",
          "Делим на 2: x = 4"
        ],
        explanation: "Минус перед скобкой меняет знак у 3x → -3x, у -2 → +2"
      },
      solutionSteps: [
        "1️⃣ Раскрываем скобки: 3x - 2x + 5 = 14",
        "2️⃣ Упрощаем: x + 5 = 14",
        "3️⃣ Вычитаем 5: x = 9"
      ],
      theory: {
        rule: "Минус перед скобкой: -(a - b) = -a + b",
        visual: "-(2x - 5) = -2x + 5",
        explanation: "Минус перед скобкой меняет знаки всех слагаемых внутри:\n• Было 2x → стало -2x\n• Было -5 → стало +5",
        formula: "3x - (2x - 5) = 3x - 2x + 5 = x + 5"
      },
      hintSteps: ["Раскрой скобки (меняем знак у 2x и -5)", "x + 5 = 14", "x = 9"]
    },
    6: {
      q: "5x - 8 = 2x + 10",
      a: 6,
      example: {
        text: "4x - 3 = x + 6",
        answer: 3,
        steps: [
          "Переносим x влево: 4x - x = 6 + 3",
          "3x = 9",
          "x = 3"
        ],
        explanation: "Все x в одну сторону, числа в другую."
      },
      solutionSteps: [
        "1️⃣ Переносим 2x влево: 5x - 2x - 8 = 10",
        "2️⃣ Переносим -8 вправо: 3x = 18",
        "3️⃣ Делим на 3: x = 6"
      ],
      theory: {
        rule: "x в одну сторону, числа в другую",
        visual: "5x - 8 = 2x + 10 → 5x - 2x = 10 + 8",
        explanation: "При переносе слагаемого через равно знак меняется на противоположный.",
        formula: "5x - 8 = 2x + 10 → 3x = 18 → x = 6"
      },
      hintSteps: ["Перенеси 2x влево", "Перенеси -8 вправо", "3x = 18", "x = 6"]
    },
    7: {
      q: "x² - 9 = 0",
      a: 3,
      example: {
        text: "x² - 4 = 0",
        answer: 2,
        steps: [
          "Переносим -4: x² = 4",
          "Извлекаем корень: x = 2"
        ],
        explanation: "Квадратное уравнение без x: x² = a → x = √a"
      },
      solutionSteps: [
        "1️⃣ Переносим -9: x² = 9",
        "2️⃣ Извлекаем корень: x = 3"
      ],
      theory: {
        rule: "x² - a = 0 → x² = a → x = √a",
        visual: "x² = 9 → x = 3",
        explanation: "Берём положительный корень: √9 = 3, потому что 3² = 9",
        formula: "x² - 9 = 0 → x² = 9 → x = 3"
      },
      hintSteps: ["Перенеси -9", "x² = 9", "x = 3"]
    },
    8: {
      q: "(2x - 3)/4 = 5",
      a: 11.5,
      example: {
        text: "(3x - 1)/2 = 7",
        answer: 5,
        steps: [
          "Умножаем на 2: 3x - 1 = 14",
          "Переносим -1: 3x = 15",
          "Делим на 3: x = 5"
        ],
        explanation: "Сначала умножаем на знаменатель, затем решаем линейное уравнение."
      },
      solutionSteps: [
        "1️⃣ Умножаем на 4: 2x - 3 = 20",
        "2️⃣ Переносим -3: 2x = 23",
        "3️⃣ Делим на 2: x = 11.5"
      ],
      theory: {
        rule: "(ax - b)/c = d → ax - b = cd",
        visual: "(2x - 3)/4 = 5 → 2x - 3 = 20",
        explanation: "Сначала избавляемся от дроби, затем решаем линейное уравнение.",
        formula: "(2x - 3)/4 = 5 → 2x - 3 = 20 → 2x = 23 → x = 11.5"
      },
      hintSteps: ["Умножь на 4", "2x - 3 = 20", "2x = 23", "x = 11.5"]
    },
    9: {
      q: "2x + 3 = 4x - 5",
      a: 4,
      example: {
        text: "3x + 2 = 4x - 1",
        answer: 3,
        steps: [
          "Переносим 3x вправо: 2 = 4x - 3x - 1",
          "2 = x - 1",
          "x = 3"
        ],
        explanation: "Собираем x в правой части, числа в левой."
      },
      solutionSteps: [
        "1️⃣ Переносим 4x влево: 2x - 4x + 3 = -5",
        "2️⃣ -2x + 3 = -5",
        "3️⃣ Переносим 3: -2x = -8",
        "4️⃣ Делим на -2: x = 4"
      ],
      theory: {
        rule: "Собираем x вместе, числа вместе",
        visual: "2x + 3 = 4x - 5 → 2x - 4x = -5 - 3",
        explanation: "При переносе через равно знак меняется на противоположный.",
        formula: "2x + 3 = 4x - 5 → -2x = -8 → x = 4"
      },
      hintSteps: ["Перенеси 4x влево", "-2x + 3 = -5", "Перенеси 3", "-2x = -8", "x = 4"]
    },
    10: {
      q: "3(x - 2) + 4 = 2(x + 1) + 10",
      a: 14,
      example: {
        text: "2(x - 1) + 3 = x + 5",
        answer: 4,
        steps: [
          "Раскрываем скобки: 2x - 2 + 3 = x + 5",
          "Упрощаем: 2x + 1 = x + 5",
          "Переносим x: 2x - x = 5 - 1",
          "x = 4"
        ],
        explanation: "Сначала раскрываем все скобки, затем решаем."
      },
      solutionSteps: [
        "1️⃣ Раскрываем скобки: 3x - 6 + 4 = 2x + 2 + 10",
        "2️⃣ Упрощаем: 3x - 2 = 2x + 12",
        "3️⃣ Переносим 2x влево: 3x - 2x - 2 = 12",
        "4️⃣ x - 2 = 12",
        "5️⃣ x = 14"
      ],
      theory: {
        rule: "Сложное уравнение: скобки → упрощение → перенос",
        visual: "3(x - 2) = 3x - 6",
        explanation: "Пошагово раскрываем скобки, упрощаем, переносим слагаемые.",
        formula: "3(x - 2) + 4 = 2(x + 1) + 10 → 3x - 6 + 4 = 2x + 2 + 10 → 3x - 2 = 2x + 12 → x = 14"
      },
      hintSteps: ["Раскрой скобки", "3x - 6 + 4 = 2x + 2 + 10", "Упрости", "3x - 2 = 2x + 12", "Перенеси 2x", "x = 14"]
    }
  };
  return questionsData[level] || questionsData[1];
};

// Компонент Game Over (без Date.now)
const GameOverScreen = ({ score, onRestart }) => (
  <div style={styles.gameOverContainer}>
    <div style={styles.gameOverCard}>
      <div style={styles.gameOverEmoji}>💀⚡💀</div>
      <div style={styles.gameOverTitle}>[CRITICAL ERROR]</div>
      <div style={styles.gameOverCode}>MATH_MODULE COMPROMISED</div>
      <div style={styles.gameOverScore}>FINAL_SCORE: {score} pts</div>
      <div style={styles.gameOverMessage}>Система перегружена. Перезапуск модуля...</div>
      <button onClick={onRestart} style={styles.gameOverBtn}>🔄 REBOOT SYSTEM</button>
    </div>
  </div>
);

export default function MathGame({ onComplete, level, onGameEnd }) {
  const currentLevel = Math.min(parseInt(level) || 1, 10);
  const [currentQuestion] = useState(getQuestionData(currentLevel));
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
  
  const inputRef = useRef(null);
  const audioResumed = useRef(false);
  const tickIntervalRef = useRef(null);

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
          setErrorFeedback("ВРЕМЯ ВЫШЛО!");
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
    if (!showExplanation && inputRef.current && lives > 0 && !isGameOver) {
      inputRef.current.focus();
    }
  }, [showExplanation, lives, isGameOver]);

  const checkAnswer = () => {
    if (showExplanation || lives <= 0 || isGameOver) return;
    const userAnswer = parseFloat(answer);
    const isCorrect = userAnswer === currentQuestion.a;
    
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
        setErrorFeedback("🎯 НЕРВЫ ЖЕЛЕЗНЫЕ! +20");
        setTimeout(() => setErrorFeedback(''), 1500);
      }
      
      const pointsEarned = 50 + comboBonus + nerveBonus;
      setCombo(newCombo);
      setScore(prev => prev + pointsEarned);
      setShowExplanation(true);
      setShowTheory(true);
      setIsTimerActive(false);
      playCorrect();
      setShake(true);
      setTimeout(() => setShake(false), 150);
      
      if (wasCritical) {
        setTimeout(() => setWasCriticalWin(false), 2000);
      }
    } else {
      const newWrongCount = wrongCount + 1;
      setWrongCount(newWrongCount);
      setCombo(0);
      const newLives = lives - 1;
      setLives(newLives);
      playError();
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setErrorFeedback(`❌ НЕВЕРНО! Осталось попыток: ${newLives}`);
      if (newWrongCount >= 2 && !showHint) {
        setShowHint(true);
        setHintLevel(1);
        setTimeLeft(prev => Math.max(prev - 5, 5));
      }
      if (newLives <= 0) {
        setIsGameOver(true);
        if (onGameEnd) onGameEnd({ win: false, score });
      } else {
        setTimeLeft(20);
        setIsTimerActive(true);
        setAnswer('');
      }
    }
  };

  const showNextHint = () => {
    if (hintLevel < currentQuestion.hintSteps.length) {
      setHintLevel(prev => prev + 1);
      setTimeLeft(prev => Math.max(prev - 5, 5));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showExplanation && lives > 0 && !isGameOver) {
      checkAnswer();
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
  };

  const comboBonus = Math.floor(combo / 3) * 20;
  const timePercent = (timeLeft / 20) * 100;

  if (isGameOver) {
    return <GameOverScreen score={score} onRestart={handleRestart} />;
  }

  const getHintVisual = () => {
    const hint = currentQuestion.hintSteps[hintLevel - 1];
    if (hint === "Подели на 2") return "2x² = 32 → x² = ?";
    if (hint === "Раскрой скобки (меняем знаки)") return "4x - (x + 2) → 4x - x - 2";
    if (hint === "Перенеси 2") return "x/3 + 2 = 7 → x/3 = ?";
    if (hint === "Умножь на 2") return "(x + 4)/2 = 9 → x + 4 = 18";
    if (hint === "Раскрой скобки (меняем знак у 2x и -5)") return "3x - (2x - 5) → 3x - 2x + 5";
    if (hint === "Перенеси 2x влево") return "5x - 2x - 8 = 10";
    if (hint === "Умножь на 4") return "(2x - 3)/4 = 5 → 2x - 3 = 20";
    return null;
  };

  return (
    <div style={{ ...styles.container, ...(glitchEffect && styles.glitchContainer) }}>
      <div style={{ 
        ...styles.pulseBorder, 
        ...(pulseEffect && styles.pulseBorderActive),
        ...(wasCriticalWin && styles.pulseBorderSuccess)
      }}>
        
        <div style={styles.topBar}>
          <div style={styles.livesContainer}>
            <span style={styles.livesLabel}>SYSTEM INTEGRITY:</span>
            <span style={styles.livesValue}>
              {Array(lives).fill('▮').join('')}
              {Array(3 - lives).fill('▯').join('')}
            </span>
          </div>
          <div style={styles.statBox}>⭐ {score}</div>
          {combo >= 3 && <div style={styles.comboBox}>🔥 x{Math.floor(combo / 3)}</div>}
          <div style={{ ...styles.timerBox, ...(timeLeft <= 5 && styles.timerUrgent) }}>
            ⏱️ {timeLeft}s
          </div>
        </div>

        <div style={styles.timerBar}>
          <div style={{ 
            ...styles.timerFill, 
            width: `${timePercent}%`,
            background: timeLeft <= 5 ? '#f85149' : '#238636'
          }} />
        </div>

        {comboBonus > 0 && <div style={styles.comboBonus}>🔥 КОМБО БОНУС +{comboBonus}</div>}

        <div style={styles.levelBadge}>
          <span style={styles.levelBadgeText}>УРОВЕНЬ {currentLevel}/10</span>
        </div>

        <div style={styles.exampleCard}>
          <div style={styles.exampleHeader}> ПРИМЕР (разбор)</div>
          <div style={styles.exampleQuestion}>{currentQuestion.example.text} = ?</div>
          <div style={styles.exampleSteps}>
            {currentQuestion.example.steps.map((step, i) => (
              <div key={i} style={styles.exampleStep}>→ {step}</div>
            ))}
          </div>
          <div style={styles.exampleAnswer}> Ответ: x = {currentQuestion.example.answer}</div>
          <div style={styles.exampleNote}>💡 {currentQuestion.example.explanation}</div>
        </div>

        <div style={{ ...styles.questionCard, ...(shake && styles.shake) }}>
          <div style={styles.questionHeader}>РЕШИ УРАВНЕНИЕ</div>
          <div style={styles.question}>{currentQuestion.q}</div>
          
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
          
          <div style={styles.buttonRow}>
            {!showExplanation ? (
              <>
                <button onClick={checkAnswer} style={styles.checkBtn}>ПРОВЕРИТЬ</button>
                <button onClick={showNextHint} style={{ ...styles.hintBtn, opacity: (!showHint && wrongCount < 2) ? 0.5 : 1 }} disabled={!showHint && wrongCount < 2}>
                  ПОДСКАЗКА
                </button>
              </>
            ) : null}
          </div>
          
          {!showHint && wrongCount < 2 && !showExplanation && lives > 0 && (
            <div style={styles.hintLocked}>🔒 Подсказка после {2 - wrongCount} ошибок</div>
          )}
        </div>

        {showHint && !showExplanation && hintLevel > 0 && (
          <div style={styles.hintBox}>
            <div style={styles.hintTitle}>💡 ПОДСКАЗКА {hintLevel}/{currentQuestion.hintSteps.length}</div>
            <div style={styles.hintText}>{currentQuestion.hintSteps[hintLevel - 1]}</div>
            {getHintVisual() && (
              <div style={styles.hintVisual}>{getHintVisual()}</div>
            )}
            {hintLevel < currentQuestion.hintSteps.length && (
              <button onClick={showNextHint} style={styles.nextHintBtn}>ЕЩЁ →</button>
            )}
            <div style={styles.hintPenalty}>⚠️ Использование подсказки отнимает 5 секунд</div>
          </div>
        )}

        {errorFeedback && !showExplanation && (
          <div style={styles.errorBox}>⚠️ {errorFeedback}</div>
        )}

        {showExplanation && showTheory && (
          <div style={styles.explainBox}>
            <div style={styles.explainHeader}>✅ ПРАВИЛЬНО! +{50 + comboBonus}</div>
            
            <div style={styles.theoryBox}>
              <div style={styles.theoryTitle}> ПРАВИЛО</div>
              <div style={styles.theoryRule}>{currentQuestion.theory.rule}</div>
              <div style={styles.theoryVisual}>
                <code>{currentQuestion.theory.visual}</code>
              </div>
              <div style={styles.theoryExplanation}>
                {currentQuestion.theory.explanation.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
              <div style={styles.theoryFormula}>
                <span style={styles.theoryFormulaLabel}>ФОРМУЛА:</span>
                <code>{currentQuestion.theory.formula}</code>
              </div>
            </div>
            
            <div style={styles.solutionBox}>
              <div style={styles.solutionTitle}> РЕШЕНИЕ ПО ШАГАМ</div>
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

            <button onClick={() => { if (onComplete) onComplete(true); }} style={styles.continueBtn}>
              ПРОДОЛЖИТЬ →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    background: '#0d1117',
    borderRadius: '20px',
    color: '#e6edf3',
    fontFamily: 'monospace',
    position: 'relative',
  },
  glitchContainer: {
    animation: 'glitch 0.15s infinite',
  },
  pulseBorder: {
    transition: 'box-shadow 0.1s ease',
  },
  pulseBorderActive: {
    boxShadow: '0 0 0 2px #f85149, 0 0 0 4px rgba(248, 81, 73, 0.3)',
    borderRadius: '20px',
    animation: 'pulseBorder 0.5s infinite',
  },
  pulseBorderSuccess: {
    boxShadow: '0 0 0 2px #238636, 0 0 0 4px rgba(35, 134, 54, 0.3)',
    borderRadius: '20px',
    animation: 'pulseBorder 0.3s ease-out',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '12px 16px',
    background: '#161b22',
    borderRadius: '8px',
  },
  livesContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#0d1117',
    padding: '4px 12px',
    borderRadius: '4px',
    border: '1px solid #30363d',
  },
  livesLabel: {
    fontSize: '10px',
    color: '#8b949e',
  },
  livesValue: {
    fontSize: '14px',
    color: '#f85149',
    letterSpacing: '2px',
  },
  statBox: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FAC775',
  },
  comboBox: {
    background: '#e94560',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  timerBox: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FAC775',
  },
  timerUrgent: {
    color: '#f85149',
    animation: 'pulse 0.5s infinite',
  },
  timerBar: {
    height: '4px',
    background: '#30363d',
    borderRadius: '2px',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s linear',
  },
  comboBonus: {
    textAlign: 'center',
    background: 'rgba(233, 69, 96, 0.15)',
    padding: '8px',
    borderRadius: '8px',
    marginBottom: '16px',
    color: '#e94560',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  levelBadge: {
    textAlign: 'center',
    marginBottom: '16px',
  },
  levelBadgeText: {
    background: 'rgba(233, 69, 96, 0.15)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#e94560',
  },
  exampleCard: {
    background: 'rgba(79, 195, 247, 0.08)',
    border: '1px solid rgba(79, 195, 247, 0.2)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  },
  exampleHeader: {
    fontSize: '11px',
    color: '#4fc3f7',
    marginBottom: '12px',
    letterSpacing: '1px',
  },
  exampleQuestion: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FAC775',
    marginBottom: '12px',
  },
  exampleSteps: {
    background: '#0d1117',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  exampleStep: {
    fontSize: '13px',
    color: '#c9d1d9',
    padding: '4px 0',
    fontFamily: 'monospace',
  },
  exampleAnswer: {
    fontSize: '14px',
    color: '#238636',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  exampleNote: {
    fontSize: '12px',
    color: '#8b949e',
    padding: '8px',
    background: 'rgba(79, 195, 247, 0.05)',
    borderRadius: '6px',
  },
  questionCard: {
    background: '#161b22',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  shake: {
    animation: 'shake 0.3s ease-in-out',
  },
  questionHeader: {
    fontSize: '12px',
    color: '#8b949e',
    marginBottom: '12px',
    letterSpacing: '1px',
  },
  question: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '24px',
    fontFamily: 'monospace',
  },
  input: {
    width: '120px',
    padding: '14px',
    fontSize: '24px',
    background: '#0d1117',
    border: '2px solid #30363d',
    borderRadius: '8px',
    color: '#fff',
    textAlign: 'center',
    margin: '0 auto 20px',
    outline: 'none',
    appearance: 'textfield',
    MozAppearance: 'textfield',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  checkBtn: {
    background: '#238636',
    color: '#fff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  hintBtn: {
    background: '#1f6feb',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  hintLocked: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#6e7681',
    marginTop: '14px',
  },
  hintBox: {
    background: 'rgba(31, 111, 235, 0.08)',
    border: '1px solid rgba(31, 111, 235, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
  },
  hintTitle: {
    color: '#1f6feb',
    marginBottom: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  hintText: {
    fontSize: '14px',
    marginBottom: '8px',
  },
  hintVisual: {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#FAC775',
    background: '#0d1117',
    padding: '6px 10px',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  hintPenalty: {
    fontSize: '10px',
    color: '#f85149',
    marginTop: '8px',
  },
  nextHintBtn: {
    background: 'none',
    border: '1px solid #1f6feb',
    color: '#1f6feb',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
  },
  errorBox: {
    background: 'rgba(216, 90, 48, 0.1)',
    border: '1px solid #D85A30',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    color: '#F0997B',
    fontSize: '14px',
    textAlign: 'center',
  },
  explainBox: {
    background: '#161b22',
    border: '2px solid #238636',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '20px',
  },
  explainHeader: {
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '16px',
    color: '#238636',
  },
  theoryBox: {
    marginBottom: '20px',
    padding: '16px',
    background: 'rgba(79, 195, 247, 0.05)',
    borderRadius: '8px',
  },
  theoryTitle: {
    color: '#4fc3f7',
    marginBottom: '12px',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  theoryRule: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#FAC775',
    marginBottom: '12px',
  },
  theoryVisual: {
    background: '#0d1117',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '12px',
    textAlign: 'center',
    fontFamily: 'monospace',
    fontSize: '16px',
    color: '#e94560',
  },
  theoryExplanation: {
    fontSize: '13px',
    color: '#c9d1d9',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  theoryFormula: {
    background: '#0d1117',
    padding: '10px',
    borderRadius: '6px',
    borderLeft: '3px solid #e94560',
  },
  theoryFormulaLabel: {
    fontSize: '11px',
    color: '#8b949e',
    display: 'block',
    marginBottom: '6px',
  },
  solutionBox: {
    padding: '16px',
    background: 'rgba(250, 199, 117, 0.05)',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  solutionTitle: {
    color: '#FAC775',
    marginBottom: '12px',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  solutionStep: {
    padding: '8px 0',
    borderBottom: '1px solid #30363d',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  solutionStepHovered: {
    color: '#FAC775',
    paddingLeft: '12px',
    borderLeft: '3px solid #FAC775',
  },
  continueBtn: {
    width: '100%',
    background: '#238636',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '16px',
  },
  gameOverContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #1a0a0a 0%, #0d1117 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  gameOverCard: {
    textAlign: 'center',
    background: '#161b22',
    padding: '40px',
    borderRadius: '16px',
    border: '1px solid #f85149',
    boxShadow: '0 0 40px rgba(248, 81, 73, 0.2)',
  },
  gameOverEmoji: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  gameOverTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#f85149',
    marginBottom: '12px',
    fontFamily: 'monospace',
  },
  gameOverCode: {
    fontSize: '14px',
    color: '#FAC775',
    marginBottom: '12px',
    fontFamily: 'monospace',
  },
  gameOverScore: {
    fontSize: '18px',
    color: '#FAC775',
    marginBottom: '12px',
  },
  gameOverMessage: {
    fontSize: '12px',
    color: '#8b949e',
    marginBottom: '24px',
  },
  gameOverBtn: {
    background: '#238636',
    color: '#fff',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      15% { transform: translateX(-8px); }
      30% { transform: translateX(8px); }
      45% { transform: translateX(-6px); }
      60% { transform: translateX(6px); }
      75% { transform: translateX(-3px); }
      90% { transform: translateX(3px); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes pulseBorder {
      0%, 100% { box-shadow: 0 0 0 0 rgba(248, 81, 73, 0.4); }
      50% { box-shadow: 0 0 0 4px rgba(248, 81, 73, 0.6); }
    }
    @keyframes glitch {
      0% { transform: translate(0); }
      20% { transform: translate(-1px, 1px); }
      40% { transform: translate(-1px, -1px); }
      60% { transform: translate(1px, 1px); }
      80% { transform: translate(1px, -1px); }
      100% { transform: translate(0); }
    }
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type="number"] {
      -moz-appearance: textfield;
      appearance: textfield;
    }
  `;
  document.head.appendChild(style);
}