import React, { createContext, useState, useEffect, useCallback } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [progress, setProgress] = useState({ physics: 0, chemistry: 0, math: 0 });
  const [totalScore, setTotalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);

  // Функция logout
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("offlineProgress");
    setToken(null);
    setUser(null);
    setProgress({ physics: 0, chemistry: 0, math: 0 });
    setTotalScore(0);
    setXp(0);
    setLevel(1);
    setStreak(0);
  }, []);

  // Функция fetchProfile - с нормализацией прогресса
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("Raw profile data:", data);
        
        setUser(data.user);
        
        // НОРМАЛИЗАЦИЯ ПРОГРЕССА - извлекаем levelCompleted
        const rawProgress = data.progress || {};
        const normalizedProgress = {
          physics: 0,
          chemistry: 0,
          math: 0
        };
        
        // physics
        if (rawProgress.physics) {
          const phys = rawProgress.physics;
          normalizedProgress.physics = typeof phys === 'number' ? phys : (phys.levelCompleted || 0);
        }
        // chemistry
        if (rawProgress.chemistry) {
          const chem = rawProgress.chemistry;
          normalizedProgress.chemistry = typeof chem === 'number' ? chem : (chem.levelCompleted || 0);
        }
        // math
        if (rawProgress.math) {
          const math = rawProgress.math;
          normalizedProgress.math = typeof math === 'number' ? math : (math.levelCompleted || 0);
        }
        
        console.log("Normalized progress:", normalizedProgress);
        setProgress(normalizedProgress);
        setTotalScore(data.totalScore || data.user?.xp || 0);
        setXp(data.user?.xp || 0);
        setLevel(data.user?.level || 1);
        setStreak(data.user?.streak || 0);
      } else if (res.status === 401) {
        logout();
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
    }
  }, [token, logout]);

  // Функция fetchLeaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error("Fetch leaderboard error:", error);
    }
  }, []);

  // ОСНОВНАЯ ФУНКЦИЯ - completeLevelWithXP
  const completeLevelWithXP = useCallback(async (subject, levelNum, score, isPerfect = false, isWin = true) => {
    console.log("completeLevelWithXP called:", { subject, levelNum, score, isPerfect, isWin });
    
    if (!token) {
      console.log('Offline mode: XP not saved');
      return { success: true, xpGained: isWin ? 100 : 10 };
    }

    try {
      const res = await fetch(`${API_URL}/api/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          subject, 
          level: levelNum, 
          score, 
          isPerfect, 
          isWin 
        })
      });

      if (res.ok) {
        const data = await res.json();
        console.log("XP response:", data);
        
        setTotalScore(prev => prev + score);
        setProgress(prev => ({
          ...prev,
          [subject]: Math.max(prev[subject], levelNum)
        }));
        
        if (data.newXp) setXp(data.newXp);
        if (data.newLevel) setLevel(data.newLevel);
        
        return { success: true, ...data };
      } else if (res.status === 401) {
        logout();
        return { success: false, error: 'Unauthorized' };
      } else {
        const error = await res.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      console.error('Complete level error:', error);
      return { success: false, error: 'Network error' };
    }
  }, [token, logout]);

  // Старая функция completeLevel (для совместимости)
  const completeLevel = useCallback(async (subject, levelNum, score) => {
    return completeLevelWithXP(subject, levelNum, score, false, true);
  }, [completeLevelWithXP]);

  // Функция login
  const login = useCallback(async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        setProgress({ physics: 0, chemistry: 0, math: 0 });
        setTotalScore(0);
        setXp(0);
        setLevel(1);
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  }, []);

  // Функция register
  const register = useCallback(async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        setProgress({ physics: 0, chemistry: 0, math: 0 });
        setTotalScore(0);
        setXp(0);
        setLevel(1);
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.message || "Registration failed" };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Network error" };
    }
  }, []);

  // Инициализация данных при загрузке приложения
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      
      const savedProgress = localStorage.getItem("offlineProgress");
      if (savedProgress && !token) {
        const offline = JSON.parse(savedProgress);
        setProgress({
          physics: offline.physics || 0,
          chemistry: offline.chemistry || 0,
          math: offline.math || 0
        });
        setTotalScore(offline.totalScore || 0);
      }
      
      if (token) {
        await fetchProfile();
        await fetchLeaderboard();
      } else {
        await fetchLeaderboard();
      }
      
      setLoading(false);
    };
    
    init();
  }, [token, fetchProfile, fetchLeaderboard]);

  const value = {
    user,
    token,
    progress,
    totalScore,
    leaderboard,
    loading,
    xp,
    level,
    streak,
    login,
    register,
    logout,
    completeLevel,
    completeLevelWithXP,
    fetchLeaderboard,
    fetchProfile,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;