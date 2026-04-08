const express = require("express");
const db = require("../db/pool");
const auth = require("../middleware/auth");

const router = express.Router();

// Get profile + progress
router.get("/profile", auth, (req, res) => {
  const userId = req.user.id;
  db.all("SELECT * FROM progress WHERE user_id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "Server error" });
    const progress = {};
    rows.forEach(row => {
      progress[row.subject] = Math.max(progress[row.subject] || 0, row.level);
    });

    db.get("SELECT SUM(score) as total FROM progress WHERE user_id = ?", [userId], (err, row) => {
      if (err) return res.status(500).json({ error: "Server error" });
      const totalScore = row ? row.total || 0 : 0;
      res.json({ user: req.user, progress, totalScore });
    });
  });
});

// Save progress
router.post("/progress", auth, (req, res) => {
  const { subject, level, score } = req.body;
  if (!subject || !level || score === undefined) return res.status(400).json({ error: "Subject, level, score required" });

  db.run(
    "INSERT OR REPLACE INTO progress (user_id, subject, level, score) VALUES (?, ?, ?, ?)",
    [req.user.id, subject, level, score],
    function(err) {
      if (err) res.status(500).json({ error: "Server error" });
      else res.json({ ok: true });
    }
  );
});

module.exports = router;