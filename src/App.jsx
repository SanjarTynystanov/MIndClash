import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from './context/AppContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import SubjectPage from './pages/SubjectPage'
import QuizPage from './pages/QuizPage'

function App() {
  const context = useContext(AppContext);
  
  if (!context) {
    return <div>Loading...</div>;
  }
  
  const { user } = context;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
        <Route path="/subject/:subject" element={<SubjectPage />} />
        <Route path="/quiz/:subject/:level" element={<QuizPage />} />
        {/* Добавляем альтернативный маршрут для /game */}
        <Route path="/game/:subject/:level" element={<QuizPage />} />
        {/* Редирект со старых ссылок */}
        <Route path="/game/*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App