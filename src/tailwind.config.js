/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        // Наши основные цвета из постера
        dark: '#06060F',
        neonBlue: '#00c8ff',
        neonPurple: '#8060ff',
        neonPink: '#ff3c78',
        neonGreen: '#00ff99',
        neonYellow: '#f0c020',
      }
    },
  },
  plugins: [],
}