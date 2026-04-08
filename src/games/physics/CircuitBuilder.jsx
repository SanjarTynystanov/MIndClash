import { useState } from 'react';

export default function CircuitBuilder({ onComplete }) {
  const [battery, setBattery] = useState(false);
  const [wire1, setWire1] = useState(false);
  const [wire2, setWire2] = useState(false);
  const [bulb, setBulb] = useState(false);
  
  const isCircuitComplete = battery && wire1 && wire2 && bulb;
  
  const checkComplete = () => {
    if (isCircuitComplete) {
      onComplete(true);
    } else {
      alert("Circuit incomplete! Connect all components!");
    }
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚡ Circuit Builder</h2>
      <p style={styles.instruction}>Connect all components to light up the bulb!</p>
      
      <div style={styles.circuit}>
        <div style={{ ...styles.component, background: battery ? "#4caf50" : "#f44336" }} onClick={() => setBattery(!battery)}>
          🔋 Battery {battery && "✅"}
        </div>
        <div style={styles.wire}>───</div>
        <div style={{ ...styles.component, background: wire1 ? "#4caf50" : "#f44336" }} onClick={() => setWire1(!wire1)}>
          ⚡ Wire 1 {wire1 && "✅"}
        </div>
        <div style={styles.wire}>───</div>
        <div style={{ ...styles.component, background: wire2 ? "#4caf50" : "#f44336" }} onClick={() => setWire2(!wire2)}>
          ⚡ Wire 2 {wire2 && "✅"}
        </div>
        <div style={styles.wire}>───</div>
        <div style={{ ...styles.component, background: bulb ? "#4caf50" : "#f44336" }} onClick={() => setBulb(!bulb)}>
          💡 Bulb {bulb && "✅"}
        </div>
      </div>
      
      <div style={styles.bulbContainer}>
        <div style={{ ...styles.bulb, opacity: isCircuitComplete ? 1 : 0.2 }}>
          {isCircuitComplete ? "💡✨ LIT! ✨💡" : "💡 Bulb is OFF"}
        </div>
      </div>
      
      <button onClick={checkComplete} style={styles.checkButton}>Check Circuit</button>
    </div>
  );
}

const styles = {
  container: { background: "#1a1a2e", borderRadius: "15px", padding: "30px", textAlign: "center" },
  title: { color: "#e94560", marginBottom: "10px" },
  instruction: { color: "#888", marginBottom: "20px" },
  circuit: { display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "10px", margin: "30px 0" },
  component: { padding: "15px 25px", borderRadius: "10px", cursor: "pointer", color: "#fff", fontWeight: "bold" },
  wire: { fontSize: "20px", color: "#888" },
  bulbContainer: { padding: "30px", margin: "20px 0", background: "#0a0a1a", borderRadius: "10px" },
  bulb: { fontSize: "24px", fontWeight: "bold", transition: "opacity 0.3s" },
  checkButton: { background: "#e94560", color: "white", border: "none", padding: "12px 30px", fontSize: "16px", borderRadius: "8px", cursor: "pointer" }
};