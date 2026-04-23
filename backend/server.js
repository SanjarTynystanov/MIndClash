const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_12345";

// Подключение SQLite
const db = new sqlite3.Database(path.join(__dirname, "mindclash.db"));
global.db = db;

// Создание таблиц
db.serialize(() => {
  // Таблица users
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    highest_streak INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Таблица progress
  db.run(`CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    level INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, subject)
  )`);
  
  // Таблица scores
  db.run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  
  console.log("✅ SQLite tables ready");
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
const xpNeededForLevel = (level) => Math.floor(100 * Math.pow(level, 1.5));

// ===== РОУТЫ =====

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Регистрация
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  
  if (username.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  }
  
  if (password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed], function(err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ error: "Username already taken" });
        }
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      const token = jwt.sign({ userId: this.lastID }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ 
        token, 
        user: { id: this.lastID, username, xp: 0, level: 1 } 
      });
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Логин
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    try {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ 
        token, 
        user: { id: user.id, username: user.username, xp: user.xp || 0, level: user.level || 1 } 
      });
    } catch (bcryptErr) {
      console.error("Bcrypt error:", bcryptErr);
      res.status(500).json({ error: "Server error" });
    }
  });
});

// Профиль (возвращает прогресс для ВСЕХ предметов)
app.get("/api/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token" });
  }
  
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    db.get("SELECT id, username, xp, level, streak, highest_streak FROM users WHERE id = ?", [userId], (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Получаем прогресс и создаём объект со ВСЕМИ предметами
      db.all("SELECT subject, level, score FROM progress WHERE user_id = ?", [userId], (err, progressRows) => {
        // Создаём объект с дефолтными значениями для всех предметов
        const progress = {
          physics: { levelCompleted: 0, bestScore: 0 },
          chemistry: { levelCompleted: 0, bestScore: 0 },
          math: { levelCompleted: 0, bestScore: 0 }
        };
        
        if (progressRows) {
          progressRows.forEach(row => {
            progress[row.subject] = {
              levelCompleted: row.level || 0,
              bestScore: row.score || 0
            };
          });
        }
        
        res.json({
          user: { 
            ...user, 
            xpNeededForNext: xpNeededForLevel(user.level + 1),
            xpToNextLevel: xpNeededForLevel(user.level + 1) - (user.xp || 0)
          },
          progress,
          totalScore: user.xp || 0,
          stats: { total_games: 0, total_wins: 0, total_perfect_games: 0 }
        });
      });
    });
  } catch (err) {
    console.error("Token error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

// Leaderboard
app.get("/api/leaderboard", (req, res) => {
  db.all(`
    SELECT username, COALESCE(SUM(score), 0) as total_score 
    FROM users 
    LEFT JOIN scores ON users.id = scores.user_id 
    GROUP BY users.id 
    ORDER BY total_score DESC 
    LIMIT 10
  `, (err, rows) => {
    if (err) {
      console.error("Leaderboard error:", err);
      return res.json([]);
    }
    res.json(rows || []);
  });
});

// Обновление прогресса
app.post("/api/progress", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token" });
  }
  
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const { subject, level, score, isWin } = req.body;
    
    // Сохраняем результат в scores
    db.run("INSERT INTO scores (user_id, subject, score, level) VALUES (?, ?, ?, ?)",
      [userId, subject, score, level]);
    
    // Обновляем прогресс
    db.run(`
      INSERT INTO progress (user_id, subject, level, score)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, subject) DO UPDATE SET
        level = MAX(level, excluded.level),
        score = MAX(score, excluded.score),
        updated_at = CURRENT_TIMESTAMP
    `, [userId, subject, level, score]);
    
    // Начисляем XP
    const xpGain = isWin ? 50 : 10;
    db.get("SELECT xp, level FROM users WHERE id = ?", [userId], (err, user) => {
      if (err) return res.status(500).json({ error: "DB error" });
      
      const newXp = (user?.xp || 0) + xpGain;
      const newLevel = Math.floor(Math.pow(newXp / 100, 1/1.5)) + 1;
      db.run("UPDATE users SET xp = ?, level = ? WHERE id = ?", [newXp, newLevel, userId]);
      
      res.json({ success: true, xpGained: xpGain, newXp, newLevel });
    });
  } catch (err) {
    console.error("Progress error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`MindClash backend running on port ${PORT}`));