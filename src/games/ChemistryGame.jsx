import { useState, useEffect, useRef } from "react";

// ==================== LEVELS ====================
const LEVELS = {
  1: {
    formula: "H₂O",
    name: "Water",
    nameRu: "Вода",
    hint: "Hydrogen + Oxygen",
    hintRu: "Водород + Кислород",
    fact: "💧 Covers 71% of Earth's surface",
    factRu: "💧 Покрывает 71% поверхности Земли",
    equation: "2H₂ + O₂ → 2H₂O",
    color: "#4fc3f7",
    liquidColor: "#2196f3",
    bgColor: "rgba(79,195,247,0.15)",
    requiredCounts: { H2: 2, O2: 1 },
    unlocks: ["Na", "Cl2"],
  },
  2: {
    formula: "CO₂",
    name: "Carbon Dioxide",
    nameRu: "Углекислый газ",
    hint: "Carbon + Oxygen",
    hintRu: "Углерод + Кислород",
    fact: "🌿 Used by plants for photosynthesis",
    factRu: "🌿 Используется растениями для фотосинтеза",
    equation: "C + O₂ → CO₂",
    color: "#B4B2A9",
    liquidColor: "#9e9e9e",
    bgColor: "rgba(180,178,169,0.15)",
    requiredCounts: { C: 1, O2: 1 },
    unlocks: ["C"],
  },
  3: {
    formula: "NaCl",
    name: "Table Salt",
    nameRu: "Поваренная соль",
    hint: "Sodium + Chlorine",
    hintRu: "Натрий + Хлор",
    fact: "🍽️ Essential for human life",
    factRu: "🍽️ Необходим для жизни человека",
    equation: "2Na + Cl₂ → 2NaCl",
    color: "#ffffff",
    liquidColor: "#e0e0e0",
    bgColor: "rgba(255,255,255,0.1)",
    requiredCounts: { Na: 2, Cl2: 1 },
    unlocks: ["S"],
  },
  4: {
    formula: "CH₄",
    name: "Methane",
    nameRu: "Метан",
    hint: "Carbon + Hydrogen",
    hintRu: "Углерод + Водород",
    fact: "🔥 Main component of natural gas",
    factRu: "🔥 Основной компонент природного газа",
    equation: "C + 2H₂ → CH₄",
    color: "#FAC775",
    liquidColor: "#ff9800",
    bgColor: "rgba(250,199,117,0.15)",
    requiredCounts: { C: 1, H2: 2 },
    unlocks: [],
  },
  5: {
    formula: "H₂SO₄",
    name: "Sulfuric Acid",
    nameRu: "Серная кислота",
    hint: "Hydrogen + Sulfur + Oxygen",
    hintRu: "Водород + Сера + Кислород",
    fact: "⚡ Most produced chemical worldwide",
    factRu: "⚡ Самое производимое химическое вещество",
    equation: "H₂ + S + 2O₂ → H₂SO₄",
    color: "#E8D44D",
    liquidColor: "#cddc39",
    bgColor: "rgba(232,212,77,0.15)",
    requiredCounts: { H2: 1, S: 1, O2: 2 },
    unlocks: [],
  },
};

const ALL_REAGENTS = [
  { id: "H2",  name: "Hydrogen", nameRu: "Водород", display: "H₂", color: "#378ADD", fill: "rgba(55,138,221,0.3)" },
  { id: "O2",  name: "Oxygen",   nameRu: "Кислород", display: "O₂", color: "#D85A30", fill: "rgba(216,90,48,0.3)" },
  { id: "Na",  name: "Sodium",   nameRu: "Натрий",  display: "Na", color: "#EF9F27", fill: "rgba(239,159,39,0.3)" },
  { id: "Cl2", name: "Chlorine", nameRu: "Хлор",    display: "Cl₂", color: "#639922", fill: "rgba(99,153,34,0.3)" },
  { id: "C",   name: "Carbon",   nameRu: "Углерод", display: "C",   color: "#888780", fill: "rgba(136,135,128,0.3)" },
  { id: "S",   name: "Sulfur",   nameRu: "Сера",    display: "S",   color: "#BA7517", fill: "rgba(186,117,23,0.3)" },
];

const PALETTE = ["#85B7EB","#F5C4B3","#FAC775","#C0DD97","#D3D1C7","#FAE0A0"];
const MAX_LIVES = 3;

// Фиксированные позиции для анимаций
const BUBBLE_POSITIONS = [
  { cx: 45, cy: 120 }, { cx: 60, cy: 115 }, { cx: 75, cy: 125 }, { cx: 50, cy: 130 },
  { cx: 65, cy: 135 }, { cx: 80, cy: 128 }, { cx: 55, cy: 140 }, { cx: 70, cy: 145 }
];

const CO2_BUBBLE_POSITIONS = [
  { cx: 55, cy: 125 }, { cx: 70, cy: 130 }, { cx: 60, cy: 140 }, { cx: 75, cy: 135 },
  { cx: 65, cy: 145 }, { cx: 80, cy: 140 }
];

const ACID_POSITIONS = [
  { cx: 55, cy: 100 }, { cx: 70, cy: 105 }, { cx: 60, cy: 115 }, { cx: 75, cy: 110 }
];

const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

// ==================== FLASK COMPONENT ====================
function FlaskSVG({ liquidColor, liquidOpacity, animState, currentFormula }) {
  const bubbles = animState === "success";
  const error = animState === "error";

  return (
    <svg width="130" height="180" viewBox="0 0 130 180" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id="flaskClipChem">
          <path d="M45,55 L22,140 Q19,162 65,162 Q111,162 108,140 L85,55 Z" />
        </clipPath>
      </defs>

      <rect
        x="0" y="90" width="130" height="80"
        fill={error ? "#E24B4A" : liquidColor}
        opacity={error ? 0.6 : liquidOpacity}
        clipPath="url(#flaskClipChem)"
        style={{ transition: "fill 0.3s, opacity 0.3s" }}
      />

      {bubbles && (
        <>
          {currentFormula === "H₂O" && BUBBLE_POSITIONS.map((pos, i) => (
            <circle
              key={`bubble-${i}`}
              cx={pos.cx}
              cy={pos.cy}
              r={3 + (i % 4)}
              fill="#fff"
              opacity="0.7"
              style={{ animation: `bubbleAnim ${1 + i * 0.1}s ease-in infinite`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
          
          {currentFormula === "CO₂" && CO2_BUBBLE_POSITIONS.map((pos, i) => (
            <circle
              key={`co2-${i}`}
              cx={pos.cx}
              cy={pos.cy}
              r={2 + (i % 3)}
              fill="#fff"
              opacity="0.5"
              style={{ animation: `bubbleAnim ${0.8 + i * 0.1}s ease-in infinite` }}
            />
          ))}
          
          {currentFormula === "NaCl" && SPARK_ANGLES.map((angle, i) => {
            const rad = angle * Math.PI / 180;
            return (
              <circle
                key={`spark-${i}`}
                cx={65 + Math.cos(rad) * 20}
                cy={110 + Math.sin(rad) * 15}
                r={2}
                fill="#FFD700"
                style={{ animation: `sparkAnim ${0.4}s ease-out forwards`, animationDelay: `${i * 0.05}s` }}
              />
            );
          })}
          
          {currentFormula === "CH₄" && [0,1,2,3,4].map(i => (
            <path
              key={`flame-${i}`}
              d={`M${55 + i * 5},95 Q${60 + i * 5},75 ${65 + i * 5},95`}
              fill="#ff6600"
              opacity="0.7"
              style={{ animation: `flameAnim ${0.3 + i * 0.1}s ease-in-out infinite alternate` }}
            />
          ))}
          
          {currentFormula === "H₂SO₄" && ACID_POSITIONS.map((pos, i) => (
            <circle
              key={`acid-${i}`}
              cx={pos.cx}
              cy={pos.cy}
              r={3}
              fill="#cddc39"
              opacity="0.8"
              style={{ animation: `acidDrop ${0.6 + i * 0.1}s ease-in infinite` }}
            />
          ))}
        </>
      )}

      <path
        d="M45,55 L22,140 Q19,162 65,162 Q111,162 108,140 L85,55 Z"
        fill="none"
        stroke="rgba(150,200,180,0.6)"
        strokeWidth="2"
      />
      <rect x="43" y="12" width="44" height="45" rx="2" fill="none" stroke="rgba(150,200,180,0.6)" strokeWidth="2" />
      <rect x="49" y="6" width="32" height="10" rx="4" fill="rgba(150,200,180,0.25)" stroke="rgba(150,200,180,0.6)" strokeWidth="1.5" />

      <style>{`
        @keyframes bubbleAnim {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-50px) scale(0.3); opacity: 0; }
        }
        @keyframes sparkAnim {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes flameAnim {
          0% { opacity: 0.4; transform: scaleY(0.8); }
          100% { opacity: 1; transform: scaleY(1.2); }
        }
        @keyframes acidDrop {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-40px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </svg>
  );
}

// ==================== TEST TUBE COMPONENT ====================
function TubeSVG({ color, fill }) {
  return (
    <svg width="36" height="56" viewBox="0 0 36 56">
      <rect x="2" y="2" width="32" height="6" rx="3" fill={color} opacity="0.9" />
      <rect x="4" y="8" width="28" height="42" rx="0" fill="rgba(0,0,0,0.15)" />
      <rect x="4" y="26" width="28" height="24" rx="0" fill={fill} />
      <rect x="4" y="8" width="28" height="42" rx="8"
        fill="none" stroke={color} strokeWidth="1.5" opacity="0.7" />
      <rect x="8" y="12" width="6" height="20" rx="3" fill="rgba(255,255,255,0.12)" />
    </svg>
  );
}

// ==================== FIREWORKS COMPONENT ====================
function Fireworks({ onComplete }) {
  const [positions] = useState(() => {
    const pos = [];
    for (let i = 0; i < 20; i++) {
      pos.push({ left: Math.random() * 100, delay: Math.random() * 2 });
    }
    return pos;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {positions.map((pos, idx) => (
        <div
          key={idx}
          className="firework-particle"
          style={{
            position: "absolute",
            bottom: "20%",
            left: `${pos.left}%`,
            width: "4px",
            height: "4px",
            background: "#FFD700",
            borderRadius: "50%",
            boxShadow: "0 0 10px #FFD700",
            animation: "fireworkAnim 0.5s ease-out forwards",
            animationDelay: `${pos.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes fireworkAnim {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function ChemistryGame({ onComplete, lang = "en", onScoreUpdate, onGameEnd, level }) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [selectedReagents, setSelectedReagents] = useState([]);
  const [reagentCounts, setReagentCounts] = useState({ H2: 0, O2: 0, Na: 0, Cl2: 0, C: 0, S: 0 });
  const [flaskState, setFlaskState] = useState("idle");
  const [flaskColor, setFlaskColor] = useState("#9FE1CB");
  const [message, setMessage] = useState(null);
  const [shakeFlask, setShakeFlask] = useState(false);
  const [gameStatus, setGameStatus] = useState("playing");
  const [showFireworks, setShowFireworks] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  const msgTimer = useRef(null);
  
  // Используем уровень из пропсов (от родителя)
  const currentLevelNumber = parseInt(level) || 1;
  const currentLevel = LEVELS[currentLevelNumber];
  
  const isGameOver = gameStatus === "gameover";
  const isWin = gameStatus === "win";
  const getText = (en, ru) => lang === "en" ? en : ru;

  // Вычисляем разблокированные реагенты на основе уровня (без useEffect)
  const unlockedReagents = (() => {
    const unlocks = ["H2", "O2"];
    for (let i = 1; i <= currentLevelNumber; i++) {
      if (LEVELS[i]?.unlocks) {
        unlocks.push(...LEVELS[i].unlocks);
      }
    }
    return [...new Set(unlocks)];
  })();

  // Сброс состояния при смене уровня - используем useMemo или просто обновляем при рендере
  // Вместо useEffect с setState, используем key от родителя

  // Показываем подсказку когда осталась 1 жизнь
  useEffect(() => {
    if (lives === 1 && !showHint && gameStatus === "playing") {
      const timer = setTimeout(() => setShowHint(true), 100);
      return () => clearTimeout(timer);
    }
  }, [lives, showHint, gameStatus]);

  useEffect(() => {
    return () => clearTimeout(msgTimer.current);
  }, []);

  const getMixColor = (counts) => { 
    const total = Object.values(counts).reduce((a, b) => a + b, 0); 
    if (total === 0) return "#9FE1CB"; 
    return PALETTE[total % PALETTE.length]; 
  };
  
  const showMessage = (text, type, sub = "") => { 
    setMessage({ text, type, sub }); 
    clearTimeout(msgTimer.current); 
    msgTimer.current = setTimeout(() => setMessage(null), 2000); 
  };

  const toggleReagent = (reagentId) => {
    if (isGameOver || isWin || hasCompleted) return;
    
    const currentCount = reagentCounts[reagentId] || 0;
    const required = currentLevel.requiredCounts[reagentId] || 0;
    
    if (required === 0) {
      if (currentCount === 0) {
        setReagentCounts(prev => ({ ...prev, [reagentId]: 1 }));
        setSelectedReagents(prev => [...prev, reagentId]);
      } else {
        setReagentCounts(prev => ({ ...prev, [reagentId]: 0 }));
        setSelectedReagents(prev => prev.filter(id => id !== reagentId));
      }
      return;
    }
    
    if (currentCount >= required) {
      const newCount = currentCount - 1;
      if (newCount === 0) {
        setSelectedReagents(prev => prev.filter(id => id !== reagentId));
        setReagentCounts(prev => ({ ...prev, [reagentId]: 0 }));
      } else {
        setReagentCounts(prev => ({ ...prev, [reagentId]: newCount }));
      }
    } else {
      const newCount = currentCount + 1;
      setReagentCounts(prev => ({ ...prev, [reagentId]: newCount }));
      if (!selectedReagents.includes(reagentId)) {
        setSelectedReagents(prev => [...prev, reagentId]);
      }
    }
  };

  const handleClear = () => {
    if (isGameOver || isWin || hasCompleted) return;
    setSelectedReagents([]);
    setReagentCounts({ H2: 0, O2: 0, Na: 0, Cl2: 0, C: 0, S: 0 });
    setFlaskState("idle");
    setFlaskColor("#9FE1CB");
  };

  const handleReact = () => {
    if (isGameOver || isWin || hasCompleted) return;
    if (selectedReagents.length === 0) { 
      showMessage(getText("Select reagents!", "Выберите реагенты!"), "warn", ""); 
      return; 
    }

    // Проверка правильности
    let isCorrect = true;
    for (const [reagent, required] of Object.entries(currentLevel.requiredCounts)) {
      if ((reagentCounts[reagent] || 0) !== required) { 
        isCorrect = false; 
        break; 
      }
    }

    if (isCorrect) {
      // ПРАВИЛЬНЫЙ ОТВЕТ - завершаем уровень
      setHasCompleted(true);
      const pointsEarned = 50;
      const newScore = score + pointsEarned;
      setScore(newScore);
      setCorrectStreak(correctStreak + 1);
      setFlaskColor(currentLevel.liquidColor);
      setFlaskState("success");
      showMessage(getText(`Correct! +${pointsEarned} points`, `Правильно! +${pointsEarned} очков`), "ok", currentLevel.equation);
      
      if (onScoreUpdate) onScoreUpdate(pointsEarned);
      
      // Сообщаем родителю об успешном завершении уровня
      setTimeout(() => {
        if (onComplete) onComplete(true);
      }, 1500);
      
    } else {
      // НЕПРАВИЛЬНЫЙ ОТВЕТ
      const newLives = lives - 1;
      setLives(newLives);
      setCorrectStreak(0);
      setFlaskState("error");
      setShakeFlask(true);
      
      if (newLives > 0 && !showHint) {
        setTimeout(() => setShowHint(true), 100);
      }
      showMessage(getText("Wrong reaction! -1 life", "Неверная реакция! -1 жизнь"), "err", getText("Try again", "Попробуй снова"));
      
      setTimeout(() => { 
        handleClear(); 
        setFlaskState("idle"); 
        setShakeFlask(false); 
      }, 1000);
      
      if (newLives <= 0) { 
        setTimeout(() => { 
          setGameStatus("gameover");
          if (onGameEnd) onGameEnd({ win: false, score });
          if (onComplete) onComplete(false);
        }, 1000); 
      }
    }
  };

  const handleRestart = () => {
    setScore(0);
    setLives(MAX_LIVES);
    setCorrectStreak(0);
    setSelectedReagents([]);
    setReagentCounts({ H2: 0, O2: 0, Na: 0, Cl2: 0, C: 0, S: 0 });
    setFlaskState("idle");
    setFlaskColor("#9FE1CB");
    setGameStatus("playing");
    setShowFireworks(false);
    setMessage(null);
    setShowHint(false);
    setHasCompleted(false);
  };

  const renderLives = () => { 
    const hearts = []; 
    for (let i = 0; i < MAX_LIVES; i++) {
      hearts.push(<span key={i} style={{ transition: "all 0.2s", opacity: i < lives ? 1 : 0.2 }}>{i < lives ? "❤️" : "🖤"}</span>);
    }
    return hearts; 
  };

  if (!currentLevel) {
    return <div style={styles.root}>Loading...</div>;
  }

  if (isWin) return (
    <div style={styles.winScreen}>
      <div style={styles.winContent}>
        <div style={styles.winEmoji}>🏆✨🧪✨🏆</div>
        <div style={styles.winTitle}>{getText("VICTORY!", "ПОБЕДА!")}</div>
        <div style={styles.winText}>{getText("You created the substance!", "Вы создали вещество!")}</div>
        <div style={styles.winScore}>{getText("Score:", "Счёт:")} {score} {getText("points", "очков")}</div>
        <button onClick={handleRestart} style={styles.restartBtn}>{getText("🔬 Play again", "🔬 Играть снова")}</button>
      </div>
      {showFireworks && <Fireworks onComplete={() => setShowFireworks(false)} />}
    </div>
  );

  if (isGameOver) return (
    <div style={styles.gameoverScreen}>
      <div style={styles.gameoverContent}>
        <div style={styles.gameoverEmoji}>💀⚗️💀</div>
        <div style={styles.gameoverTitle}>{getText("GAME OVER", "GAME OVER")}</div>
        <div style={styles.gameoverText}>{getText("Too many mistakes in the lab!", "Слишком много ошибок в лаборатории!")}</div>
        <div style={styles.gameoverScore}>{getText("Your score:", "Ваш счёт:")} {score} {getText("points", "очков")}</div>
        <button onClick={handleRestart} style={styles.restartBtn}>{getText("🧪 Start over", "🧪 Начать заново")}</button>
      </div>
    </div>
  );

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <div style={styles.livesBox}><span style={styles.livesLabel}>{getText("Lives", "Жизни")}</span><div style={styles.hearts}>{renderLives()}</div></div>
        <div style={styles.scoreBox}><span style={styles.scoreLabel}>{getText("Score", "Очки")}</span><span style={styles.scoreVal}>{score}</span></div>
        <div style={styles.streakBox}><span style={styles.streakLabel}>{getText("Combo", "Комбо")}</span><span style={{...styles.streakVal, color: correctStreak >= 3 ? "#FAC775" : "#e6edf3"}}>{correctStreak} 🔥</span></div>
      </div>

      <div style={styles.targetBox}>
        <div>
          <div style={styles.targetLabel}>{getText("Create substance:", "Создать вещество:")}</div>
          <div style={{ ...styles.targetFormula, color: currentLevel.color }}>{currentLevel.formula}</div>
          <div style={styles.targetName}>{getText(currentLevel.name, currentLevel.nameRu)}</div>
        </div>
        <div style={styles.targetRight}>
          {showHint && (
            <div style={styles.hintBox}>
              <div style={styles.hintLabel}>💡 {getText("HINT", "ПОДСКАЗКА")}</div>
              <div style={styles.hintText}>{getText(currentLevel.hint, currentLevel.hintRu)}</div>
              <div style={styles.equationHint}>{currentLevel.equation}</div>
              <div style={styles.factBox}>📖 {getText(currentLevel.fact, currentLevel.factRu)}</div>
            </div>
          )}
          {!showHint && lives > 1 && (
            <div style={styles.hintLocked}>
              <span style={{ opacity: 0.5 }}>🔒 {getText("Hint appears after 2 mistakes", "Подсказка появится после 2 ошибок")}</span>
            </div>
          )}
        </div>
      </div>

      <div style={styles.bench}>
        <div>
          <div style={styles.panelLabel}>{getText("Reagents (click to add)", "Реагенты (нажми, чтобы добавить)")}</div>
          <div style={styles.reagentsGrid}>
            {ALL_REAGENTS.filter(r => unlockedReagents.includes(r.id)).map(r => {
              const currentCount = reagentCounts[r.id] || 0;
              const required = currentLevel.requiredCounts[r.id] || 0;
              const isSelected = currentCount > 0;
              const isMaxed = currentCount >= required && required > 0;
              return (
                <button key={r.id} onClick={() => toggleReagent(r.id)} disabled={isMaxed && required > 0 || hasCompleted} style={{ ...styles.reagentBtn, borderColor: isSelected ? r.color : "rgba(255,255,255,0.1)", background: isSelected ? r.fill : "rgba(255,255,255,0.04)", opacity: isMaxed || hasCompleted ? 0.5 : 1, cursor: isMaxed || hasCompleted ? "not-allowed" : "pointer" }}>
                  <TubeSVG color={r.color} fill={r.fill} />
                  <div style={{ ...styles.reagentFormula, color: r.color }}>{r.display}</div>
                  <div style={styles.reagentName}>{getText(r.name, r.nameRu)}</div>
                  {required > 0 && (<div style={styles.reagentCount}>{currentCount} / {required}</div>)}
                  {isSelected && <div style={{ ...styles.selMark, background: r.color }}>✓</div>}
                </button>
              );
            })}
            {ALL_REAGENTS.filter(r => !unlockedReagents.includes(r.id)).map(r => (
              <div key={r.id} style={styles.lockedReagent}>
                <div style={{ fontSize: 24, opacity: 0.3 }}>🔒</div>
                <div style={{ fontSize: 12, opacity: 0.4 }}>{r.display}</div>
                <div style={{ fontSize: 10, opacity: 0.3 }}>{getText(r.name, r.nameRu)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.flaskPanel}>
          <div style={styles.panelLabel}>{getText("Flask", "Колба")}</div>
          <div style={{ ...styles.flaskWrap, animation: shakeFlask ? "shakeChem 0.5s ease" : "none" }}>
            <FlaskSVG
              liquidColor={flaskState === "idle" ? getMixColor(reagentCounts) : flaskColor}
              liquidOpacity={selectedReagents.length > 0 || flaskState !== "idle" ? 0.7 : 0.25}
              animState={flaskState}
              currentFormula={currentLevel.formula}
            />
          </div>
          <div style={styles.chips}>
            {selectedReagents.length === 0 ? <span style={styles.chipsEmpty}>⚗️ {getText("Select reagents", "Выбери реагенты")}</span> : selectedReagents.map((id, idx) => { const count = reagentCounts[id]; const r = ALL_REAGENTS.find(x => x.id === id); return (<span key={idx} style={{ ...styles.chip, borderColor: r?.color, color: r?.color }}>{r?.display} {count > 1 ? `×${count}` : ""}</span>); })}
          </div>
          <div style={styles.btnRow}>
            <button onClick={handleReact} disabled={selectedReagents.length === 0 || hasCompleted} style={{ ...styles.btnReact, opacity: selectedReagents.length === 0 || hasCompleted ? 0.45 : 1, cursor: selectedReagents.length === 0 || hasCompleted ? "not-allowed" : "pointer" }}>🔬 {getText("React", "Реакция")}</button>
            <button onClick={handleClear} disabled={hasCompleted} style={{ ...styles.btnClear, opacity: hasCompleted ? 0.45 : 1, cursor: hasCompleted ? "not-allowed" : "pointer" }}>🧹 {getText("Clear", "Очистить")}</button>
          </div>
        </div>
      </div>

      <div style={styles.msgArea}>{message && (<div style={{ ...styles.msgBox, borderColor: message.type === "ok" ? "#1D9E75" : message.type === "err" ? "#D85A30" : "#7F77DD", background: message.type === "ok" ? "rgba(29,158,117,0.15)" : message.type === "err" ? "rgba(216,90,48,0.15)" : "rgba(127,119,221,0.15)" }}><div style={{ ...styles.msgText, color: message.type === "ok" ? "#5DCAA5" : message.type === "err" ? "#F0997B" : "#AFA9EC" }}>{message.text}</div>{message.sub && <div style={styles.msgSub}>{message.sub}</div>}</div>)}</div>

      <style>{`
        @keyframes shakeChem { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// ==================== STYLES ====================
const styles = {
  root: { background: "linear-gradient(135deg, #0a0f1a 0%, #0d1117 100%)", borderRadius: "24px", padding: "24px", color: "#e6edf3", fontFamily: "'Segoe UI', 'Inter', system-ui, sans-serif", maxWidth: "800px", margin: "0 auto", border: "1px solid rgba(79,195,247,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid rgba(79,195,247,0.2)" },
  livesBox: { display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "6px 14px" },
  livesLabel: { fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px", textTransform: "uppercase" },
  hearts: { display: "flex", gap: "6px", fontSize: "18px" },
  scoreBox: { background: "rgba(29,158,117,0.15)", borderRadius: "16px", padding: "8px 20px", textAlign: "center", border: "1px solid rgba(29,158,117,0.3)" },
  scoreLabel: { display: "block", fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "2px", textTransform: "uppercase" },
  scoreVal: { fontSize: "26px", fontWeight: "700", color: "#5DCAA5" },
  streakBox: { display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "6px 14px" },
  streakLabel: { fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px", textTransform: "uppercase" },
  streakVal: { fontSize: "20px", fontWeight: "600" },
  targetBox: { display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "16px", padding: "16px 20px", marginBottom: "24px", border: "1px solid rgba(79,195,247,0.3)", background: "rgba(79,195,247,0.05)" },
  targetLabel: { fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" },
  targetFormula: { fontSize: "32px", fontWeight: "700", lineHeight: 1.1 },
  targetName: { fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "4px" },
  targetRight: { textAlign: "right", maxWidth: "250px" },
  hintBox: { background: "rgba(0,0,0,0.5)", borderRadius: "12px", padding: "10px 14px", border: "1px solid #FAC775", animation: "fadeIn 0.3s ease" },
  hintLocked: { fontSize: "11px", color: "rgba(255,255,255,0.3)", padding: "8px" },
  hintLabel: { fontSize: "10px", color: "#FAC775", marginBottom: "4px", textTransform: "uppercase" },
  hintText: { fontSize: "13px", color: "rgba(255,255,255,0.7)" },
  equationHint: { fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "6px" },
  factBox: { fontSize: "11px", color: "#FAC775", marginTop: "8px", paddingTop: "6px", borderTop: "1px solid rgba(255,255,255,0.1)" },
  bench: { display: "grid", gridTemplateColumns: "1fr 200px", gap: "24px", alignItems: "start" },
  panelLabel: { fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" },
  reagentsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" },
  reagentBtn: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "10px 6px 8px", cursor: "pointer", textAlign: "center", position: "relative", transition: "all 0.2s ease", display: "flex", flexDirection: "column", alignItems: "center" },
  lockedReagent: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "10px 6px 8px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.5 },
  reagentFormula: { fontSize: "15px", fontWeight: "600", marginTop: "6px" },
  reagentName: { fontSize: "10px", color: "rgba(255,255,255,0.4)", marginTop: "2px" },
  reagentCount: { fontSize: "9px", color: "#FAC775", marginTop: "2px" },
  selMark: { position: "absolute", top: "6px", right: "6px", width: "18px", height: "18px", borderRadius: "50%", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: "700" },
  flaskPanel: { display: "flex", flexDirection: "column", alignItems: "center" },
  flaskWrap: { marginBottom: "12px" },
  chips: { display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", minHeight: "34px", marginBottom: "14px" },
  chipsEmpty: { fontSize: "12px", color: "rgba(255,255,255,0.25)", alignSelf: "center" },
  chip: { border: "1px solid", borderRadius: "8px", padding: "4px 12px", fontSize: "12px", fontWeight: "500" },
  btnRow: { display: "flex", flexDirection: "column", gap: "8px", width: "100%" },
  btnReact: { background: "linear-gradient(135deg, #1D9E75, #157a58)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: "600", transition: "all 0.15s", width: "100%", cursor: "pointer" },
  btnClear: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "10px", fontSize: "13px", color: "rgba(255,255,255,0.5)", cursor: "pointer", width: "100%", transition: "all 0.15s" },
  msgArea: { marginTop: "20px", minHeight: "70px" },
  msgBox: { borderRadius: "12px", padding: "12px 18px", border: "1px solid", textAlign: "center" },
  msgText: { fontSize: "15px", fontWeight: "500" },
  msgSub: { fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "4px" },
  gameoverScreen: { background: "linear-gradient(135deg, #1a0a0a 0%, #0d1117 100%)", borderRadius: "24px", padding: "48px", textAlign: "center", border: "1px solid #D85A30" },
  gameoverContent: {},
  gameoverEmoji: { fontSize: "64px", marginBottom: "16px" },
  gameoverTitle: { fontSize: "36px", fontWeight: "800", color: "#D85A30", marginBottom: "12px" },
  gameoverText: { fontSize: "16px", color: "rgba(255,255,255,0.6)", marginBottom: "20px" },
  gameoverScore: { fontSize: "20px", fontWeight: "600", color: "#5DCAA5", marginBottom: "8px" },
  winScreen: { background: "linear-gradient(135deg, #0a1a0f 0%, #0d1117 100%)", borderRadius: "24px", padding: "48px", textAlign: "center", border: "1px solid #FFD700", position: "relative", overflow: "hidden" },
  winContent: { position: "relative", zIndex: 2 },
  winEmoji: { fontSize: "64px", marginBottom: "16px" },
  winTitle: { fontSize: "36px", fontWeight: "800", color: "#FFD700", marginBottom: "12px" },
  winText: { fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "20px" },
  winScore: { fontSize: "20px", fontWeight: "600", color: "#5DCAA5", marginBottom: "8px" },
  restartBtn: { background: "linear-gradient(135deg, #1D9E75, #157a58)", color: "#fff", border: "none", borderRadius: "40px", padding: "12px 32px", fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" },
};