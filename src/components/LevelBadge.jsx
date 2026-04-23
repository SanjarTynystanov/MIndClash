export default function LevelBadge({ level, size = "md", showLabel = true }) {
  const sizes = {
    sm: { fontSize: "12px", padding: "4px 8px" },
    md: { fontSize: "14px", padding: "6px 12px" },
    lg: { fontSize: "18px", padding: "8px 16px" },
  };

  const getLevelColor = (level) => {
    if (level >= 10) return "#FFD700";
    if (level >= 5) return "#e94560";
    return "#4fc3f7";
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: `rgba(${getLevelColor(level) === "#FFD700" ? "255,215,0" : "233,69,96"}, 0.15)`,
        border: `1px solid ${getLevelColor(level)}`,
        borderRadius: "20px",
        padding: sizes[size].padding,
        ...sizes[size],
      }}
    >
      <span style={{ fontSize: sizes[size].fontSize }}>🎖️</span>
      {showLabel && (
        <span style={{ fontWeight: "bold", color: getLevelColor(level) }}>
          Level {level}
        </span>
      )}
    </div>
  );
}