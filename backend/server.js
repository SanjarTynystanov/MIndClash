const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");
const leaderboardRoutes = require("./routes/leaderboard");

const app = express();

// Подключение SQLite
const db = new sqlite3.Database(path.join(__dirname, "mindclash.db"));
global.db = db;

// Создание таблиц (если нет)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subject TEXT,
    score INTEGER,
    level INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  
  console.log("✅ SQLite tables ready");
});

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", progressRoutes);
app.use("/api", leaderboardRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`MindClash backend running on port ${PORT}`));