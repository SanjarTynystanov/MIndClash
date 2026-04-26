const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'sciquest-super-secret-key-2024';

app.use(cors());
app.use(express.json());

// Database
const db = new sqlite3.Database('./mindclash.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    highest_streak INTEGER DEFAULT 0
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS game_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subject TEXT,
    difficulty TEXT,
    level_completed INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, subject, difficulty)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS game_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subject TEXT,
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_perfect_games INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, subject)
  )`);
});

// Questions for all subjects
const QUESTIONS = {
  physics: {
    easy: [
      { id: 1, question: 'What is the unit of force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], correct: 2 },
      { id: 2, question: 'What is 9.8 m/s²?', options: ['Speed of light', 'Gravity', 'Sound speed', 'Light speed'], correct: 1 },
      { id: 3, question: 'What is the formula for speed?', options: ['d/t', 't/d', 'd*t', 'm/a'], correct: 0 },
      { id: 4, question: 'What unit is power measured in?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], correct: 1 },
      { id: 5, question: 'What is Ohm\'s Law?', options: ['V=IR', 'I=VR', 'R=VI', 'V=I/R'], correct: 0 }
    ],
    medium: [
      { id: 6, question: 'Speed of light in vacuum?', options: ['3e8 m/s', '3e6 m/s', '3e10 m/s', '3e5 m/s'], correct: 0 },
      { id: 7, question: 'Kinetic energy formula?', options: ['1/2mv²', 'mv²', 'mgh', '1/2mv'], correct: 0 },
      { id: 8, question: 'Newton\'s third law?', options: ['Action-reaction', 'F=ma', 'Inertia', 'Gravity'], correct: 0 },
      { id: 9, question: 'What is wavelength?', options: ['Distance between waves', 'Wave height', 'Wave speed', 'Wave frequency'], correct: 0 },
      { id: 10, question: 'What is frequency measured in?', options: ['Hertz', 'Meters', 'Seconds', 'Joules'], correct: 0 }
    ],
    hard: [
      { id: 11, question: 'Planck\'s constant value?', options: ['6.63e-34', '3.14e-34', '9.81e-34', '1.62e-34'], correct: 0 },
      { id: 12, question: 'Schrödinger equation for?', options: ['Quantum', 'Relativity', 'Thermo', 'Electro'], correct: 0 },
      { id: 13, question: 'Escape velocity Earth?', options: ['11.2 km/s', '7.9 km/s', '9.8 km/s', '15 km/s'], correct: 0 },
      { id: 14, question: 'E=mc² is?', options: ['Relativity', 'Quantum', 'Thermo', 'Electro'], correct: 0 },
      { id: 15, question: 'Heisenberg principle?', options: ['Δx·Δp ≥ ħ/2', 'E=mc²', 'F=ma', 'V=IR'], correct: 0 }
    ]
  },
  chemistry: {
    easy: [
      { id: 1, question: 'Symbol for Gold?', options: ['Au', 'Ag', 'Fe', 'Cu'], correct: 0 },
      { id: 2, question: 'H2O is?', options: ['Water', 'Oxygen', 'Hydrogen', 'Salt'], correct: 0 },
      { id: 3, question: 'pH of pure water?', options: ['7', '0', '14', '5'], correct: 0 },
      { id: 4, question: 'Lightest element?', options: ['Hydrogen', 'Helium', 'Oxygen', 'Carbon'], correct: 0 },
      { id: 5, question: 'Plants absorb?', options: ['CO2', 'O2', 'N2', 'H2'], correct: 0 }
    ],
    medium: [
      { id: 6, question: 'Atomic number of Carbon?', options: ['6', '4', '8', '12'], correct: 0 },
      { id: 7, question: 'Table salt formula?', options: ['NaCl', 'KCl', 'CaCl2', 'MgCl2'], correct: 0 },
      { id: 8, question: 'Noble gas?', options: ['Neon', 'Oxygen', 'Nitrogen', 'Chlorine'], correct: 0 },
      { id: 9, question: 'Rusting is?', options: ['Oxidation', 'Reduction', 'Combustion', 'Melting'], correct: 0 },
      { id: 10, question: 'Covalent bond shares?', options: ['Electrons', 'Protons', 'Neutrons', 'Ions'], correct: 0 }
    ],
    hard: [
      { id: 11, question: 'Avogadro\'s number?', options: ['6.02e23', '3.14e23', '1.61e23', '9.81e23'], correct: 0 },
      { id: 12, question: 'Highest electronegativity?', options: ['Fluorine', 'Oxygen', 'Chlorine', 'Nitrogen'], correct: 0 },
      { id: 13, question: 'Methane hybridization?', options: ['sp³', 'sp', 'sp²', 'sp³d'], correct: 0 },
      { id: 14, question: 'pH of 0.1M HCl?', options: ['1', '2', '3', '4'], correct: 0 },
      { id: 15, question: 'Quantum number for shape?', options: ['l', 'n', 'm', 's'], correct: 0 }
    ]
  },
  math: {
    easy: [
      { id: 1, question: '15 + 27 = ?', options: ['42', '32', '40', '52'], correct: 0 },
      { id: 2, question: '100 - 45 = ?', options: ['55', '65', '45', '35'], correct: 0 },
      { id: 3, question: '8 × 7 = ?', options: ['56', '48', '64', '42'], correct: 0 },
      { id: 4, question: '144 ÷ 12 = ?', options: ['12', '10', '11', '13'], correct: 0 },
      { id: 5, question: '5² = ?', options: ['25', '10', '20', '30'], correct: 0 }
    ],
    medium: [
      { id: 6, question: '2x + 5 = 15, x = ?', options: ['5', '3', '7', '10'], correct: 0 },
      { id: 7, question: 'Slope of y = 3x + 2?', options: ['3', '2', '5', '1'], correct: 0 },
      { id: 8, question: '(x+3)(x-3) = ?', options: ['x²-9', 'x²+9', 'x²-6x+9', 'x²+6x+9'], correct: 0 },
      { id: 9, question: 'π ≈ ?', options: ['3.14', '3.12', '3.16', '3.18'], correct: 0 },
      { id: 10, question: '2/3 + 1/6 = ?', options: ['5/6', '1/2', '2/3', '1'], correct: 0 }
    ],
    hard: [
      { id: 11, question: 'Derivative of x²?', options: ['2x', 'x', 'x²', '2'], correct: 0 },
      { id: 12, question: '∫ x dx = ?', options: ['x²/2 + C', 'x² + C', '2x + C', 'x + C'], correct: 0 },
      { id: 13, question: 'log₂(8) = ?', options: ['3', '2', '4', '8'], correct: 0 },
      { id: 14, question: 'sin(90°) = ?', options: ['1', '0', '-1', '0.5'], correct: 0 },
      { id: 15, question: 'e ≈ ?', options: ['2.7', '2.8', '2.9', '3.0'], correct: 0 }
    ]
  }
};

// Middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
    if (err) return res.status(400).json({ error: 'Username exists' });
    const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: this.lastID, username, xp: 0, level: 1, streak: 0 } });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username, xp: user.xp, level: user.level, streak: user.streak } });
  });
});

app.get('/api/profile', auth, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    
    db.all('SELECT subject, difficulty, level_completed FROM game_progress WHERE user_id = ?', [user.id], (err, progress) => {
      const progressMap = {};
      progress.forEach(p => { progressMap[`${p.subject}_${p.difficulty}`] = p.level_completed; });
      
      db.all('SELECT subject, total_games, total_wins, total_perfect_games FROM game_stats WHERE user_id = ?', [user.id], (err, stats) => {
        const totalStats = { total_games: 0, total_wins: 0, total_perfect_games: 0 };
        stats.forEach(s => {
          totalStats.total_games += s.total_games;
          totalStats.total_wins += s.total_wins;
          totalStats.total_perfect_games += s.total_perfect_games;
        });
        
        res.json({
          user: { ...user, xpNeededForNext: 100 },
          progress: progressMap,
          stats: totalStats
        });
      });
    });
  });
});

app.post('/api/update-progress', auth, (req, res) => {
  const { subject, difficulty, completed, perfect } = req.body;
  const userId = req.user.id;
  
  if (!subject || !difficulty) {
    return res.status(400).json({ error: 'Missing subject or difficulty' });
  }

  console.log(`Saving: user=${req.user.username}, ${subject}/${difficulty}, win=${completed}, perfect=${perfect}`);
  
  const updateProgress = (cb) => {
    if (!completed) return cb(null);

    db.run(`INSERT INTO game_progress (user_id, subject, difficulty, level_completed) 
            VALUES (?, ?, ?, 1)
            ON CONFLICT(user_id, subject, difficulty) 
            DO UPDATE SET level_completed = level_completed + 1`, [userId, subject, difficulty], cb);
  };

  const updateStats = (cb) => {
    db.run(`INSERT INTO game_stats (user_id, subject, total_games, total_wins, total_perfect_games) 
            VALUES (?, ?, 1, ?, ?)
            ON CONFLICT(user_id, subject) 
            DO UPDATE SET 
              total_games = total_games + 1,
              total_wins = total_wins + ?,
              total_perfect_games = total_perfect_games + ?`,
            [userId, subject, completed ? 1 : 0, perfect ? 1 : 0, completed ? 1 : 0, perfect ? 1 : 0], cb);
  };

  const xpGain = (completed ? 10 : 0) + (perfect ? 5 : 0);

  updateProgress((err) => {
    if (err) {
      console.error('Update progress error:', err);
      return res.status(500).json({ error: 'Failed to update progress' });
    }

    updateStats((err) => {
      if (err) {
        console.error('Update stats error:', err);
        return res.status(500).json({ error: 'Failed to update stats' });
      }

      db.get('SELECT xp, level, streak FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
          console.error('Fetch user for XP update failed:', err);
          return res.status(500).json({ error: 'Failed to load user data' });
        }

        const newXp = user.xp + xpGain;
        const newLevel = 1 + Math.floor(newXp / 100);
        const newStreak = completed ? user.streak + 1 : 0;

        db.run('UPDATE users SET xp = ?, level = ?, streak = ? WHERE id = ?', [newXp, newLevel, newStreak, userId], (err) => {
          if (err) {
            console.error('Update user XP error:', err);
            return res.status(500).json({ error: 'Failed to update user XP' });
          }

          res.json({ success: true, xp_gain: xpGain, new_xp: newXp, new_level: newLevel, new_streak: newStreak });
        });
      });
    });
  });
});

// Question routes
app.get('/api/:subject/questions/:difficulty', (req, res) => {
  const { subject, difficulty } = req.params;
  if (!QUESTIONS[subject]) return res.status(404).json({ error: 'Subject not found' });
  const questions = QUESTIONS[subject][difficulty] || QUESTIONS[subject].easy;
  res.json({ questions });
});

app.post('/api/:subject/answer', (req, res) => {
  const { subject } = req.params;
  const { question_id, answer, difficulty } = req.body;
  
  if (!QUESTIONS[subject]) return res.status(404).json({ error: 'Subject not found' });
  
  const questions = QUESTIONS[subject][difficulty] || QUESTIONS[subject].easy;
  const question = questions.find(q => q.id === question_id);
  
  if (question) {
    const isCorrect = question.correct === answer;
    res.json({
      correct: isCorrect,
      correct_answer: question.options[question.correct],
      explanation: isCorrect ? 'Correct!' : `The correct answer is ${question.options[question.correct]}`
    });
  } else {
    res.status(404).json({ error: 'Question not found' });
  }
});

app.get('/api/leaderboard', (req, res) => {
  db.all('SELECT username, xp as total_score FROM users ORDER BY xp DESC LIMIT 10', [], (err, rows) => {
    res.json(rows || []);
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 Physics: http://localhost:${PORT}/api/physics/questions/easy`);
  console.log(`🧪 Chemistry: http://localhost:${PORT}/api/chemistry/questions/easy`);
  console.log(`📐 Math: http://localhost:${PORT}/api/math/questions/easy`);
});