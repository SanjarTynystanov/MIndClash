import { createContext, useState, useEffect, useCallback } from "react";

// Создаем контекст
// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [progress, setProgress] = useState({ physics: 0, chemistry: 0, math: 0 });
  const [totalScore, setTotalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProgress(data.progress || { physics: 0, chemistry: 0, math: 0 });
        setTotalScore(data.totalScore || 0);
      } else if (res.status === 401) {
        // eslint-disable-next-line react-hooks/immutability
        logout();
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  }, [token, API_URL]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error("Leaderboard error:", err);
    }
  }, [API_URL]);

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        await fetchProfile();
        return { success: true };
      }
      const error = await res.json();
      return { success: false, error: error.error };
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      return { success: false, error: "Network error" };
    }
  };

  const register = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        await fetchProfile();
        return { success: true };
      }
      const error = await res.json();
      return { success: false, error: error.error };
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setProgress({ physics: 0, chemistry: 0, math: 0 });
    setTotalScore(0);
  };

  const completeLevel = async (subject, level, score) => {
    if (!token) {
      const newProgress = { ...progress, [subject]: Math.max(progress[subject], level) };
      setProgress(newProgress);
      localStorage.setItem("offlineProgress", JSON.stringify(newProgress));
      setTotalScore(prev => prev + score);
      return { success: true };
    }

    try {
      const res = await fetch(`${API_URL}/api/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, level, score }),
      });
      
      if (res.ok) {
        await fetchProfile();
        return { success: true };
      }
      const error = await res.json();
      return { success: false, error: error.error };
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      return { success: false, error: "Network error" };
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      const offlineProgress = localStorage.getItem("offlineProgress");
      if (offlineProgress) {
        setProgress(JSON.parse(offlineProgress));
      }
    }
    fetchLeaderboard();
  }, [token, fetchProfile, fetchLeaderboard]);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        progress,
        totalScore,
        login,
        register,
        logout,
        completeLevel,
        leaderboard,
        fetchLeaderboard,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}