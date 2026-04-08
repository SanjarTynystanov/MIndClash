import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import { translations } from "../i18n/translations";

export default function AuthPage() {
  const nav = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const context = useApp();
  
  if (!context) {
    return <div className="page">Loading...</div>;
  }

  const { login, register, lang = 'en' } = context;
  const langTranslations = translations[lang] || translations.en || {};
  const t = {
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    loginDesc: 'Sign in to your account',
    registerDesc: 'Create a new account',
    invalidCredentials: 'Invalid credentials',
    usernameTaken: 'Username taken',
    needAccount: 'Need an account?',
    haveAccount: 'Have an account?',
    back: 'Back',
    ...langTranslations,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const success = isLogin ? await login(username, password) : await register(username, password);
    setLoading(false);
    if (success) {
      nav("/");
    } else {
      setError(isLogin ? t.invalidCredentials : t.usernameTaken);
    }
  };

  return (
    <div className="page animate-in" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <div className="card" style={{ width: "100%", maxWidth: "320px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
            {isLogin ? t.login : t.register}
          </h2>
          <p style={{ color: "var(--text2)" }}>
            {isLogin ? t.loginDesc : t.registerDesc}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
              {t.username}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder={t.username}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
              {t.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder={t.password}
              required
            />
          </div>

          {error && (
            <div style={{ marginBottom: "16px", color: "#ff6b6b", fontSize: "13px", textAlign: "center" }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "..." : isLogin ? t.login : t.register}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? t.needAccount : t.haveAccount}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => nav("/")}>
            ← {t.back}
          </button>
        </div>
      </div>
    </div>
  );
}