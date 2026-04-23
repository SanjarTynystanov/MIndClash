const express = require('express');
const router = express.Router();
const { db, xpNeededForLevel } = require('../models/User');
const authenticate = require('../middleware/auth');

router.get('/profile', authenticate, async (req, res) => {
  const userId = req.userId;

  try {
    // Получаем данные пользователя
    const user = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id, username, xp, level, streak, highest_streak, created_at 
        FROM users WHERE id = ?
      `, [userId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Получаем прогресс по предметам
    const progress = await new Promise((resolve, reject) => {
      db.all('SELECT subject, level_completed, total_correct, total_attempts, accuracy, best_score FROM progress WHERE user_id = ?', 
        [userId], (err, rows) => {
        if (err) reject(err);
        const progressMap = {};
        rows.forEach(row => {
          progressMap[row.subject] = {
            levelCompleted: row.level_completed,
            totalCorrect: row.total_correct,
            totalAttempts: row.total_attempts,
            accuracy: Math.round(row.accuracy * 100),
            bestScore: row.best_score
          };
        });
        resolve(progressMap);
      });
    });

    // Получаем статистику
    const stats = await new Promise((resolve, reject) => {
      db.get('SELECT total_games, total_wins, total_perfect_games, total_xp_earned FROM statistics WHERE user_id = ?', 
        [userId], (err, row) => {
        if (err) reject(err);
        resolve(row || { total_games: 0, total_wins: 0, total_perfect_games: 0, total_xp_earned: 0 });
      });
    });

    res.json({
      user: {
        ...user,
        xpToNextLevel: xpNeededForLevel(user.level + 1) - user.xp,
        xpNeededForNext: xpNeededForLevel(user.level + 1)
      },
      progress,
      stats
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;