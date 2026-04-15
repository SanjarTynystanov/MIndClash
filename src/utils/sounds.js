const playTone = (freq, type, duration) => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

export const playCorrectSound = () => playTone(600, 'sine', 0.3);
export const playErrorSound = () => playTone(200, 'square', 0.2);
export const playTickSound = () => playTone(400, 'sine', 0.05);