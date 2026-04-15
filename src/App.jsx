import { Routes, Route, Navigate, Router , useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from './context/AppContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import SubjectPage from './pages/SubjectPage'
import QuizPage from './pages/QuizPage'
import "./styles/global.css"

function App() {
  const location = useLocation(); // Получаем текущий путь
  const context = useContext(AppContext);
  
  if (!context) return <div>Loading...</div>;
  const { user } = context;

  return (
    <>
      <Navbar />
      <Routes location={location} key={location.pathname}> 
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
        <Route path="/subject/:subject" element={<SubjectPage />} />
        {/* Добавляем key прямо в элемент страницы */}
        <Route 
          path="/quiz/:subject/:level" 
          element={<QuizPage key={location.pathname} />} 
        />
        <Route 
          path="/game/:subject/:level" 
          element={<QuizPage key={location.pathname} />} 
        />
        <Route path="/game/*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
export default App;