const express = require("express");
const db = require("../db/pool");

const router = express.Router();

// Get leaderboard
router.get("/leaderboard", (req, res) => {
  db.all(`
    SELECT u.username, SUM(p.score) as total_score
    FROM users u
    LEFT JOIN progress p ON u.id = p.user_id
    GROUP BY u.id, u.username
    ORDER BY total_score DESC
    LIMIT 20
  `, [], (err, rows) => {
    if (err) res.status(500).json({ error: "Server error" });
    else res.json(rows.map(row => ({ ...row, total_score: row.total_score || 0 })));
  });
});

module.exports = router;