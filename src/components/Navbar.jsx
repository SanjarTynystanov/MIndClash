import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";

export default function Navbar() {
  const { user, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const navLinks = [
    { path: "/", label: " Home", },
    { path: "/profile", label: "👤 Profile", icon: "👤" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🧠</span>
          <span style={styles.logoText}>MindClash</span>
        </Link>

        {/* Desktop Navigation */}
        <div style={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.navLink,
                ...(isActive(link.path) && styles.activeNavLink),
              }}
            >
              {link.label}
            </Link>
          ))}
          
          {user && (
            <div style={styles.userSection}>
              <div style={styles.userInfo}>
                <span style={styles.userAvatar}>
                  {user.username?.charAt(0).toUpperCase() || "U"}
                </span>
                <span style={styles.userName}>{user.username}</span>
              </div>
              <button onClick={handleLogout} style={styles.logoutButton}>
                 Logout
              </button>
            </div>
          )}

          {!user && (
            <Link to="/auth" style={styles.authButton}>
              🔐 Login / Register
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          style={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div style={styles.mobileNav}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {user && (
            <>
              <div style={styles.mobileUserInfo}>
                <span style={styles.mobileUserAvatar}>
                  {user.username?.charAt(0).toUpperCase() || "U"}
                </span>
                <span style={styles.mobileUserName}>{user.username}</span>
              </div>
              <button onClick={handleLogout} style={styles.mobileLogoutButton}>
                🚪 Logout
              </button>
            </>
          )}

          {!user && (
            <Link
              to="/auth"
              style={styles.mobileAuthButton}
              onClick={() => setIsMenuOpen(false)}
            >
              🔐 Login / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  navbar: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    borderBottom: "1px solid rgba(233, 69, 96, 0.3)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    backdropFilter: "blur(10px)",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "12px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    transition: "transform 0.2s",
  },
  logoIcon: {
    fontSize: "28px",
    animation: "pulse 2s infinite",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #e94560, #FAC775)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  desktopNav: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    "@media (max-width: 768px)": {
      display: "none",
    },
  },
  navLink: {
    color: "#c9d1d9",
    textDecoration: "none",
    fontSize: "16px",
    padding: "8px 16px",
    borderRadius: "8px",
    transition: "all 0.3s",
    fontWeight: "500",
  },
  activeNavLink: {
    color: "#e94560",
    background: "rgba(233, 69, 96, 0.1)",
    borderBottom: "2px solid #e94560",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginLeft: "10px",
    paddingLeft: "20px",
    borderLeft: "1px solid #333",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "6px 12px",
    borderRadius: "20px",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    background: "linear-gradient(135deg,  #e94560, #FAC775)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
  },
  logoutButton: {
    background: "rgba(233, 69, 96, 0.2)",
    color: "#e94560",
    border: "1px solid rgba(233, 69, 96, 0.3)",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s",
  },
  authButton: {
    background: "linear-gradient(135deg,  #e94560, #FAC775)",
    color: "#fff",
    textDecoration: "none",
    padding: "8px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "transform 0.2s",
  },
  menuButton: {
    display: "none",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid #333",
    color: "#fff",
    fontSize: "24px",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    "@media (max-width: 768px)": {
      display: "block",
    },
  },
  mobileNav: {
    display: "none",
    flexDirection: "column",
    padding: "20px",
    background: "#1a1a2e",
    borderTop: "1px solid #333",
    "@media (max-width: 768px)": {
      display: "flex",
    },
  },
  mobileNavLink: {
    color: "#c9d1d9",
    textDecoration: "none",
    padding: "12px",
    borderRadius: "8px",
    transition: "all 0.3s",
    fontSize: "16px",
  },
  mobileUserInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    marginTop: "10px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
  },
  mobileUserAvatar: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #e94560, #533483)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff",
  },
  mobileUserName: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: "500",
  },
  mobileLogoutButton: {
    background: "rgba(233, 69, 96, 0.2)",
    color: "#e94560",
    border: "1px solid rgba(233, 69, 96, 0.3)",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "10px",
  },
  mobileAuthButton: {
    background: "linear-gradient(135deg, #e94560, #533483)",
    color: "#fff",
    textDecoration: "none",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "14px",
  },
};

// Добавляем CSS анимации
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    .logo-icon {
      animation: pulse 2s infinite;
    }
    
    button:hover {
      transform: translateY(-2px);
    }
    
    @media (max-width: 768px) {
      .desktop-only {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);
}