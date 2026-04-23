export default function XPBar({ currentXp, neededXp, level, percentage }) {
  return (
    <div style={styles.xpContainer}>
      <div style={styles.xpHeader}>
        <span style={styles.xpLabel}>XP Progress</span>
        <span style={styles.xpValue}>{currentXp} / {neededXp}</span>
      </div>
      <div style={styles.xpBar}>
        <div style={{ ...styles.xpFill, width: `${percentage}%` }} />
      </div>
      <div style={styles.xpHint}>
        {Math.round(neededXp - currentXp)} XP to Level {level + 1}
      </div>
    </div>
  );
}

const styles = {
  xpContainer: {
    marginBottom: '30px',
  },
  xpHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  },
  xpLabel: {
    color: '#888',
  },
  xpValue: {
    color: '#FAC775',
  },
  xpBar: {
    height: '12px',
    background: '#0a0a1a',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #e94560, #FAC775)',
    borderRadius: '99px',
    transition: 'width 0.3s ease',
  },
  xpHint: {
    fontSize: '11px',
    color: '#888',
    marginTop: '6px',
    textAlign: 'right',
  },
};