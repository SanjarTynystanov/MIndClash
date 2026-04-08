// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const db = require("../db/pool");

// const router = express.Router();

// // Register
// router.post("/register", async (req, res) => {
//   const { username, password } = req.body;
  
//   if (!username || !password) {
//     return res.status(400).json({ error: "Username and password required" });
//   }
  
//   if (username.length < 3) {
//     return res.status(400).json({ error: "Username must be at least 3 characters" });
//   }
  
//   if (password.length < 4) {
//     return res.status(400).json({ error: "Password must be at least 4 characters" });
//   }

//   try {
//     const hashed = await bcrypt.hash(password, 10);
//     const result = await db.runAsync(
//       "INSERT INTO users (username, password_hash) VALUES (?, ?)",
//       [username, hashed]
//     );
    
//     const user = { id: result.lastID, username };
//     const token = jwt.sign(
//       { id: user.id, username: user.username },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );
    
//     res.json({ token, user });
//   } catch (err) {
//     if (err.message && err.message.includes("UNIQUE")) {
//       res.status(400).json({ error: "Username already taken" });
//     } else {
//       console.error(err);
//       res.status(500).json({ error: "Server error" });
//     }
//   }
// });

// // Login
// router.post("/login", async (req, res) => {
//   const { username, password } = req.body;
  
//   if (!username || !password) {
//     return res.status(400).json({ error: "Username and password required" });
//   }

//   try {
//     const user = await db.getAsync(
//       "SELECT * FROM users WHERE username = ?",
//       [username]
//     );
    
//     if (!user) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }
    
//     const valid = await bcrypt.compare(password, user.password_hash);
//     if (!valid) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }
    
//     const token = jwt.sign(
//       { id: user.id, username: user.username },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );
    
//     res.json({ token, user: { id: user.id, username: user.username } });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/pool");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
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
    const result = await db.runAsync(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, hashed]
    );
    
    const user = { id: result.lastID, username };
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({ token, user });
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE")) {
      res.status(400).json({ error: "Username already taken" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const user = await db.getAsync(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;