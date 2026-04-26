import React, { useState, useEffect, useCallback } from "react";
import { AppContext } from "./AppContext.js";

const API_URL = "http://localhost:3001";

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [progress, setProgress] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({});
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
    setProgress({});
    setStats({});
    setTotalScore(0);
    setXp(0);
    setLevel(1);
    setStreak(0);
  }, []);

  // Функция fetchProfile
  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      console.log("Fetching profile from:", `${API_URL}/api/profile`);
      const res = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("Profile data received:", data);
        
        setUser(data.user);
        setStats(data.stats || {});
        
        // Нормализация прогресса
        const rawProgress = data.progress || {};
        setProgress(rawProgress);
        
        setTotalScore(data.user?.xp || 0);
        setXp(data.user?.xp || 0);
        setLevel(data.user?.level || 1);
        setStreak(data.user?.streak || 0);
      } else if (res.status === 401) {
        console.log("Token expired, logging out");
        logout();
      } else {
        console.error("Profile fetch failed with status:", res.status);
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
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
      setLeaderboard([]);
    }
  }, []);

  // Обновление прогресса после игры
  const updateGameProgress = useCallback(async (subject, difficulty, completed, perfect) => {
    if (!token) {
      console.log('No token, progress not saved');
      return { success: true, xp_gain: completed ? 10 : 0 };
    }

    try {
      // Правильный URL для обновления прогресса
      const res = await fetch(`${API_URL}/api/update-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subject, difficulty, completed, perfect })
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Progress update response:", data);
        
        if (data.new_xp) {
          setXp(data.new_xp);
          setTotalScore(data.new_xp);
        }
        if (data.new_level) setLevel(data.new_level);
        if (data.new_streak !== undefined) setStreak(data.new_streak);
        
        await fetchProfile();
        
        return { success: true, ...data };
      } else if (res.status === 401) {
        logout();
        return { success: false, error: 'Unauthorized' };
      } else {
        return { success: false, error: 'Update failed' };
      }
    } catch (error) {
      console.error('Update progress error:', error);
      return { success: false, error: 'Network error' };
    }
  }, [token, logout, fetchProfile]);

  // Login
  const login = useCallback(async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        setXp(data.user.xp || 0);
        setLevel(data.user.level || 1);
        setStreak(data.user.streak || 0);
        
        await fetchProfile();
        await fetchLeaderboard();
        
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  }, [fetchProfile, fetchLeaderboard]);

  // Register
  const register = useCallback(async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        setXp(data.user.xp || 0);
        setLevel(data.user.level || 1);
        setStreak(data.user.streak || 0);
        
        await fetchProfile();
        await fetchLeaderboard();
        
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error || "Registration failed" };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Network error" };
    }
  }, [fetchProfile, fetchLeaderboard]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      
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
    stats,
    totalScore,
    leaderboard,
    loading,
    xp,
    level,
    streak,
    login,
    register,
    logout,
    updateGameProgress,
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