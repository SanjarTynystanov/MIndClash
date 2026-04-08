const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/pool");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, hashed],
      function(err) {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT_UNIQUE") res.status(400).json({ error: "Username taken" });
          else res.status(500).json({ error: "Server error" });
        } else {
          const user = { id: this.lastID, username };
          const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
          res.json({ token, user });
        }
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  try {
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
      if (err || !user) return res.status(400).json({ error: "Invalid credentials" });

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
      res.json({ token, user: { id: user.id, username: user.username } });
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;