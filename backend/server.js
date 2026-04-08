const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");
const leaderboardRoutes = require("./routes/leaderboard");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", progressRoutes);
app.use("/api", leaderboardRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`MindClash backend running on port ${PORT}`));