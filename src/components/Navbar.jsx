import { useApp } from "../context/useApp";
import { translations } from "../i18n/translations";

const DEFAULT_TRANSLATIONS = {
  login: "Login",
  logout: "Logout",
};

export default function Navbar() {
  try {
    const context = useApp();
    
    if (!context) {
      return (
        <nav className="navbar">
          <div className="nav-content">
            <div className="nav-brand">SciQuest</div>
            <div className="nav-actions">
              <button className="lang-toggle">EN</button>
              <button className="btn btn-ghost btn-sm" onClick={() => window.location.href = "/auth"}>
                {DEFAULT_TRANSLATIONS.login}
              </button>
            </div>
          </div>
        </nav>
      );
    }
    
    const { user, logout, lang = 'en', setLang } = context;
    
    // Безопасное получение переводов
    const langTranslations = translations[lang] || translations.en || DEFAULT_TRANSLATIONS;
    const t = { ...DEFAULT_TRANSLATIONS, ...langTranslations };

    return (
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">SciQuest</div>
          <div className="nav-actions">
            <button
              className="lang-toggle"
              onClick={() => setLang && setLang(lang === "ru" ? "en" : "ru")}
            >
              {(lang || 'en').toUpperCase()}
            </button>
            {user ? (
              <button className="btn btn-ghost btn-sm" onClick={logout}>
                {t?.logout || DEFAULT_TRANSLATIONS.logout}
              </button>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => window.location.href = "/auth"}>
                {t?.login || DEFAULT_TRANSLATIONS.login}
              </button>
            )}
          </div>
        </div>
      </nav>
    );
  } catch (error) {
    console.error("Navbar error:", error);
    return (
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">SciQuest</div>
          <div className="nav-actions">
            <button className="lang-toggle">EN</button>
            <button className="btn btn-ghost btn-sm" onClick={() => window.location.href = "/auth"}>
              {DEFAULT_TRANSLATIONS.login}
            </button>
          </div>
        </div>
      </nav>
    );
  }
}