const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../mindclash.db'));

// Функция для расчёта XP до следующего уровня
const xpNeededForLevel = (level) => Math.floor(100 * Math.pow(level, 1.5));

// Функция для обновления уровня на основе XP
const updateLevel = (xp) => {
  let level = 1;
  while (xp >= xpNeededForLevel(level + 1)) {
    level++;
  }
  return level;
};

// Создание/обновление таблиц
db.serialize(() => {
  // Таблица users (расширенная)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 0,
      highest_streak INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица progress (по предметам)
  db.run(`
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      level_completed INTEGER DEFAULT 0,
      total_correct INTEGER DEFAULT 0,
      total_attempts INTEGER DEFAULT 0,
      accuracy REAL DEFAULT 0,
      best_score INTEGER DEFAULT 0,
      last_played DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, subject)
    )
  `);

  // Таблица statistics (общая)
  db.run(`
    CREATE TABLE IF NOT EXISTS statistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_games INTEGER DEFAULT 0,
      total_wins INTEGER DEFAULT 0,
      total_perfect_games INTEGER DEFAULT 0,
      total_xp_earned INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

module.exports = { db, xpNeededForLevel, updateLevel };