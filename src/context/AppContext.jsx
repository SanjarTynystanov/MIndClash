import { createContext, useState, useEffect, useCallback } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [progress, setProgress] = useState({ physics: 0, chemistry: 0, math: 0 });
  const [totalScore, setTotalScore] = useState(0);
  const [lang, setLang] = useState('en');
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProgress(data.progress || { physics: 0, chemistry: 0, math: 0 });
        setTotalScore(data.totalScore || 0);
      }
    } catch {
      // ignore
    }
  }, [token]);

  const loadLocalProgress = () => {
    const saved = localStorage.getItem("progress");
    if (saved) {
      const p = JSON.parse(saved);
      setProgress(p);
      const score = Object.values(p).reduce((a, b) => a + b * 150, 0); // approximate
      setTotalScore(score);
    }
  };

  const saveLocalProgress = (p) => {
    localStorage.setItem("progress", JSON.stringify(p));
    setProgress(p);
    const score = Object.values(p).reduce((a, b) => a + b * 150, 0);
    setTotalScore(score);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProgress({ physics: 0, chemistry: 0, math: 0 });
    setTotalScore(0);
    localStorage.removeItem("token");
  };

  const login = async (username, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      await fetchProfile();
      return true;
    }
    return false;
  };

  const register = async (username, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      return true;
    }
    return false;
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProfile();
    } else {
      loadLocalProgress();
    }
  }, [token, fetchProfile]);

  const completeLevel = async (subject, level, score) => {
    const newProgress = { ...progress, [subject]: Math.max(progress[subject], level) };
    if (token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subject, level, score }),
        });
        await fetchProfile();
      } catch {
        // fallback to local
        saveLocalProgress(newProgress);
      }
    } else {
      saveLocalProgress(newProgress);
    }
  };

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