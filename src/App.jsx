import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import HomePage from "./pages/HomePage";
import SubjectPage from "./pages/SubjectPage";
import GamePage from "./pages/GamePage";
import AuthPage from "./pages/AuthPage";
import Navbar from "./components/Navbar";
import "./styles/global.css";

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/subject/:subject" element={<SubjectPage />} />
              <Route path="/game/:subject/:level" element={<GamePage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
