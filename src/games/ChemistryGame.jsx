// import { useState } from "react";
// import { translations } from "../i18n/translations";

// const reactions = {
//   "HCl+NaOH": { effect: "neutralization", color: "clear", bubbles: false },
//   "Na+Cl2": { effect: "explosion", color: "yellow", bubbles: true },
//   "Fe+CuSO4": { effect: "displacement", color: "blue", bubbles: false },
// };

// export default function ChemistryGame({ level, lang, onComplete }) {
//   const t = translations[lang];
//   const [reagent1, setReagent1] = useState("");
//   const [reagent2, setReagent2] = useState("");
//   const [result, setResult] = useState(null);
//   const [score, setScore] = useState(0);

//   const mix = () => {
//     const key = `${reagent1}+${reagent2}`;
//     const reaction = reactions[key];
//     if (reaction) {
//       setResult(reaction);
//       setScore(s => s + 50);
//       onComplete(50);
//     } else {
//       setResult({ effect: "no reaction", color: "original", bubbles: false });
//     }
//   };

//   return (
//     <div className="page animate-in">
//       <h2>{t.chemistry} {t.level} {level}: {t.mixReagents}</h2>
//       <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
//         <select value={reagent1} onChange={e => setReagent1(e.target.value)}>
//           <option value="">{t.selectReagent}</option>
//           <option value="HCl">HCl</option>
//           <option value="NaOH">NaOH</option>
//           <option value="Na">Na</option>
//           <option value="Cl2">Cl₂</option>
//           <option value="Fe">Fe</option>
//           <option value="CuSO4">CuSO₄</option>
//         </select>
//         <span>+</span>
//         <select value={reagent2} onChange={e => setReagent2(e.target.value)}>
//           <option value="">{t.selectReagent}</option>
//           <option value="HCl">HCl</option>
//           <option value="NaOH">NaOH</option>
//           <option value="Na">Na</option>
//           <option value="Cl2">Cl₂</option>
//           <option value="Fe">Fe</option>
//           <option value="CuSO4">CuSO₄</option>
//         </select>
//         <button onClick={mix} disabled={!reagent1 || !reagent2}>{t.mix}</button>
//       </div>
//       {result && (
//         <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
//           <p>{t.result}: {result.effect}</p>
//           <div style={{
//             width: "100px",
//             height: "100px",
//             backgroundColor: result.color === "clear" ? "transparent" : result.color,
//             border: "1px solid #000",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center"
//           }}>
//             {result.bubbles && "💥"}
//           </div>
//         </div>
//       )}
//       <p>{t.score}: {score}</p>
//     </div>
//   );
// }
import { useState } from 'react';

export default function ChemistryGame({ onComplete }) {
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  
  const checkAnswer = () => {
    if (parseInt(answer) === 50) {
      setMessage('✅ Correct! +50 points!');
      setTimeout(() => onComplete(true), 1000);
    } else {
      setMessage('❌ Wrong! The correct level is 50ml. Try again!');
      setAnswer('');
      setTimeout(() => setMessage(''), 1500);
    }
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧪 Beaker Measurement</h2>
      <p style={styles.question}>How many ml of water are in the beaker?</p>
      
      <div style={styles.beakerContainer}>
        <div style={styles.beaker}>
          <div style={styles.water}></div>
          <div style={styles.waterLevel}>50ml</div>
        </div>
      </div>
      
      <div style={styles.inputArea}>
        <input type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Enter ml" style={styles.input} />
        <button onClick={checkAnswer} style={styles.checkButton}>Check Answer</button>
      </div>
      
      {message && <div style={styles.message}>{message}</div>}
    </div>
  );
}

const styles = {
  container: { background: "#1a1a2e", borderRadius: "15px", padding: "30px", textAlign: "center" },
  title: { color: "#e94560", marginBottom: "10px" },
  question: { color: "#fff", fontSize: "18px", marginBottom: "20px" },
  beakerContainer: { display: "flex", justifyContent: "center", margin: "30px 0" },
  beaker: { width: "150px", height: "200px", border: "3px solid #333", borderTop: "none", borderRadius: "0 0 20px 20px", position: "relative", background: "#0a0a1a", overflow: "hidden" },
  water: { position: "absolute", bottom: 0, width: "100%", height: "50%", background: "#4fc3f7", transition: "height 0.3s" },
  waterLevel: { position: "absolute", top: "45%", left: "50%", transform: "translateX(-50%)", color: "#fff", fontWeight: "bold", zIndex: 1 },
  inputArea: { display: "flex", gap: "15px", justifyContent: "center", marginTop: "20px" },
  input: { padding: "10px", fontSize: "16px", borderRadius: "8px", border: "1px solid #333", background: "#0a0a1a", color: "#fff", width: "150px", textAlign: "center" },
  checkButton: { background: "#e94560", color: "white", border: "none", padding: "10px 25px", fontSize: "16px", borderRadius: "8px", cursor: "pointer" },
  message: { marginTop: "20px", fontSize: "18px", fontWeight: "bold" }
};