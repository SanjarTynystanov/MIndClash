import { useState } from "react";
import { translations } from "../i18n/translations";

const reactions = {
  "HCl+NaOH": { effect: "neutralization", color: "clear", bubbles: false },
  "Na+Cl2": { effect: "explosion", color: "yellow", bubbles: true },
  "Fe+CuSO4": { effect: "displacement", color: "blue", bubbles: false },
};

export default function ChemistryGame({ level, lang, onComplete }) {
  const t = translations[lang];
  const [reagent1, setReagent1] = useState("");
  const [reagent2, setReagent2] = useState("");
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);

  const mix = () => {
    const key = `${reagent1}+${reagent2}`;
    const reaction = reactions[key];
    if (reaction) {
      setResult(reaction);
      setScore(s => s + 50);
      onComplete(50);
    } else {
      setResult({ effect: "no reaction", color: "original", bubbles: false });
    }
  };

  return (
    <div className="page animate-in">
      <h2>{t.chemistry} {t.level} {level}: {t.mixReagents}</h2>
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <select value={reagent1} onChange={e => setReagent1(e.target.value)}>
          <option value="">{t.selectReagent}</option>
          <option value="HCl">HCl</option>
          <option value="NaOH">NaOH</option>
          <option value="Na">Na</option>
          <option value="Cl2">Cl₂</option>
          <option value="Fe">Fe</option>
          <option value="CuSO4">CuSO₄</option>
        </select>
        <span>+</span>
        <select value={reagent2} onChange={e => setReagent2(e.target.value)}>
          <option value="">{t.selectReagent}</option>
          <option value="HCl">HCl</option>
          <option value="NaOH">NaOH</option>
          <option value="Na">Na</option>
          <option value="Cl2">Cl₂</option>
          <option value="Fe">Fe</option>
          <option value="CuSO4">CuSO₄</option>
        </select>
        <button onClick={mix} disabled={!reagent1 || !reagent2}>{t.mix}</button>
      </div>
      {result && (
        <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <p>{t.result}: {result.effect}</p>
          <div style={{
            width: "100px",
            height: "100px",
            backgroundColor: result.color === "clear" ? "transparent" : result.color,
            border: "1px solid #000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {result.bubbles && "💥"}
          </div>
        </div>
      )}
      <p>{t.score}: {score}</p>
    </div>
  );
}