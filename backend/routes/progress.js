const express = require('express');
const router = express.Router();
const { db, xpNeededForLevel, updateLevel } = require('../models/User');
const authenticate = require('../middleware/auth');

// Обновление прогресса после завершения уровня
router.post('/progress', authenticate, async (req, res) => {
  const userId = req.userId;
  const { subject, level, score, isPerfect, isWin } = req.body;

  try {
    // 1. Обновляем прогресс по предмету
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO progress (user_id, subject, level_completed, total_correct, total_attempts, accuracy, best_score, last_played)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, subject) DO UPDATE SET
          level_completed = MAX(level_completed, excluded.level_completed),
          total_correct = total_correct + excluded.total_correct,
          total_attempts = total_attempts + excluded.total_attempts,
          accuracy = ROUND(CAST((total_correct + excluded.total_correct) AS REAL) / (total_attempts + excluded.total_attempts), 2),
          best_score = MAX(best_score, excluded.best_score),
          last_played = CURRENT_TIMESTAMP
      `, [userId, subject, level, isWin ? 1 : 0, 1, 0, score], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // 2. Начисляем XP
    let xpGain = 0;
    if (isWin) {
      xpGain = 100; // Базовая XP за победу
      if (isPerfect) xpGain += 50; // Бонус за perfect
    } else {
      xpGain = 10; // XP за попытку
    }

    // 3. Обновляем XP пользователя
    const userData = await new Promise((resolve, reject) => {
      db.get('SELECT xp, level FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    const newXpValue = userData.xp + xpGain;
    const newLevel = updateLevel(newXpValue);
    
    await new Promise((resolve, reject) => {
      db.run('UPDATE users SET xp = ?, level = ?, last_active = CURRENT_TIMESTAMP WHERE id = ?', 
        [newXpValue, newLevel, userId], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // 4. Обновляем статистику
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO statistics (user_id, total_games, total_wins, total_perfect_games, total_xp_earned)
        VALUES (?, 1, ?, ?, ?)
        ON CONFLICT DO UPDATE SET
          total_games = total_games + 1,
          total_wins = total_wins + ?,
          total_perfect_games = total_perfect_games + ?,
          total_xp_earned = total_xp_earned + ?
      `, [userId, isWin ? 1 : 0, isPerfect ? 1 : 0, xpGain, isWin ? 1 : 0, isPerfect ? 1 : 0, xpGain], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // 5. Обновляем streak
    if (isWin) {
      await new Promise((resolve, reject) => {
        db.run('UPDATE users SET streak = streak + 1, highest_streak = MAX(streak + 1, highest_streak) WHERE id = ?', 
          [userId], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    } else {
      await new Promise((resolve, reject) => {
        db.run('UPDATE users SET streak = 0 WHERE id = ?', [userId], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    }

    res.json({
      success: true,
      xpGained: xpGain,
      newXp: newXpValue,
      newLevel: newLevel,
      xpToNextLevel: xpNeededForLevel(newLevel + 1) - newXpValue
    });
  } catch (err) {
    console.error('Progress update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получение прогресса пользователя
router.get('/progress', authenticate, async (req, res) => {
  const userId = req.userId;

  try {
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

    res.json({ progress });
  } catch (err) {
    console.error('Progress fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;