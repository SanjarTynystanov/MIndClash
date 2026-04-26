import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from './context/AppContext.js'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import SubjectPage from './pages/SubjectPage'
import QuizPage from './pages/QuizPage'
import GamePage from './pages/GamePage'
import ProfilePage from './pages/ProfilePage'
import "./styles/global.css"

function App() {
  const location = useLocation();
  const context = useContext(AppContext);
  
  if (!context) return <div>Loading...</div>;
  const { user } = context;

  return (
    <>
      <Navbar />
      <Routes location={location} key={location.pathname}> 
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/subject/:subject" element={<SubjectPage />} />
        {/* Quiz: subject и difficulty (для викторины) */}
        <Route 
          path="/quiz/:subject/:difficulty" 
          element={<QuizPage key={location.pathname} />} 
        />
        {/* Game: subject, gameType (cannon/optics/easy/medium/hard), level */}
        <Route 
          path="/game/:subject/:gameType/:level" 
          element={<GamePage key={location.pathname} />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;