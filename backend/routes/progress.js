const express = require("express");
const db = require("../db/pool");
const auth = require("../middleware/auth");

const router = express.Router();

// Get profile + progress
router.get("/profile", auth, async (req, res) => {
  try {
    const rows = await db.allAsync(
      "SELECT subject, MAX(level) as level FROM progress WHERE user_id = ? GROUP BY subject",
      [req.user.id]
    );
    
    const scoreRow = await db.getAsync(
      "SELECT SUM(score) as total FROM progress WHERE user_id = ?",
      [req.user.id]
    );
    
    const progress = {};
    rows.forEach(row => {
      progress[row.subject] = row.level;
    });
    
    res.json({
      user: req.user,
      progress,
      totalScore: scoreRow?.total || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Save progress
router.post("/progress", auth, async (req, res) => {
  const { subject, level, score } = req.body;
  
  if (!subject || !level || score === undefined) {
    return res.status(400).json({ error: "Subject, level, score required" });
  }
  
  if (level < 1 || level > 5) {
    return res.status(400).json({ error: "Level must be between 1 and 5" });
  }

  try {
    // Проверяем, не пройден ли уже этот уровень
    const existing = await db.getAsync(
      "SELECT id FROM progress WHERE user_id = ? AND subject = ? AND level = ?",
      [req.user.id, subject, level]
    );
    
    if (existing) {
      return res.status(400).json({ error: "Level already completed" });
    }
    
    // Проверяем предыдущий уровень (кроме level 1)
    if (level > 1) {
      const prevLevel = await db.getAsync(
        "SELECT id FROM progress WHERE user_id = ? AND subject = ? AND level = ?",
        [req.user.id, subject, level - 1]
      );
      
      if (!prevLevel) {
        return res.status(400).json({ error: "Complete previous level first" });
      }
    }
    
    await db.runAsync(
      "INSERT INTO progress (user_id, subject, level, score) VALUES (?, ?, ?, ?)",
      [req.user.id, subject, level, score]
    );
    
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;