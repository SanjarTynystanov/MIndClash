import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function Navbar() {
  const { user, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          🧠 MindClash
        </Link>
        
        <div style={styles.links}>
          {user ? (
            <>
              <span style={styles.user}>👤 {user.username}</span>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" style={styles.link}>Login / Register</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: "#1a1a2e",
    padding: "15px 0",
    borderBottom: "1px solid #333",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#e94560",
    textDecoration: "none",
  },
  links: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "16px",
  },
  user: {
    color: "#e94560",
    fontWeight: "bold",
  },
  logoutButton: {
    background: "#e94560",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};