const express = require("express");
const db = require("../db/pool");

const router = express.Router();

router.get("/leaderboard", async (req, res) => {
  try {
    console.log("Fetching leaderboard...");
    
    const rows = await db.allAsync(`
      SELECT u.username, COALESCE(SUM(p.score), 0) as total_score
      FROM users u
      LEFT JOIN progress p ON u.id = p.user_id
      GROUP BY u.id, u.username
      ORDER BY total_score DESC
      LIMIT 20
    `);
    
    console.log("Leaderboard data:", rows);
    res.json(rows);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

module.exports = router;