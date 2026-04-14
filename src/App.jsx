import { Routes, Route, Navigate, Router } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from './context/AppContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import SubjectPage from './pages/SubjectPage'
import QuizPage from './pages/QuizPage'
import "./styles/global.css"

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

// function App() {
//   const context = useContext(AppContext);
  
//   if (!context) {
//     return <div>Loading...</div>;
//   }
  
//   const { user } = context;

//   return (
//     <Routes>
//       <div className="min-h-screen relative overflow-hidden bg-[#06060F]">
//         <div className="bg-grid"></div>
        
//         {/* Glow orbs */}
//         <div className="glow-orb orb1"></div>
//         <div className="glow-orb orb2"></div>

//         <Navbar />   

//           <Route path="/" element={<HomePage />} />
//          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
//          <Route path="/subject/:subject" element={<SubjectPage />} />
//          <Route path="/quiz/:subject/:level" element={<QuizPage />} />
//          {/* Добавляем альтернативный маршрут для /game */}
//            <Route path="/game/:subject/:level" element={<QuizPage />} />
//          {/* Редирект со старых ссылок */}
//          <Route path="/game/*" element={<Navigate to="/" />} />
//       </div>
//     </Routes>
//   );
// }

export default App;