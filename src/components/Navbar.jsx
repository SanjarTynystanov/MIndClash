import { useApp } from "../context/useApp";
import { translations } from "../i18n/translations";

export default function Navbar() {
  const { user, logout, lang, setLang } = useApp();
  const t = translations[lang];

  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-brand">SciQuest</div>
        <div className="nav-actions">
          <button
            className="lang-toggle"
            onClick={() => setLang(lang === "ru" ? "en" : "ru")}
          >
            {lang.toUpperCase()}
          </button>
          {user ? (
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              {t.logout}
            </button>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => window.location.href = "/auth"}>
              {t.login}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}