# MindClash 🧠

Образовательная веб-игра для изучения физики, химии и математики.  
Educational web game for learning physics, chemistry, and math.

## Stack

- **Frontend**: React + Vite + React Router
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Auth**: JWT

## Project structure

```
mindclash/
├── frontend/         # React app
│   ├── src/
│   │   ├── pages/        # HomePage, AuthPage, SubjectPage, QuizPage
│   │   ├── components/   # Navbar
│   │   ├── context/      # AppContext (auth + progress state)
│   │   ├── data/         # questions.js (75 questions across 3 subjects)
│   │   ├── i18n/         # Russian + English translations
│   │   └── styles/       # global.css
│   └── .env.example
└── backend/          # Express API
    ├── routes/       # auth.js, progress.js, leaderboard.js
    ├── middleware/   # auth.js (JWT)
    ├── db/           # pool.js (PostgreSQL + auto schema init)
    └── .env.example
```

## Setup

### 1. Database
```bash
createdb sciquest
# Tables are created automatically on first run
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
node server.js
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:3001
npm install
npm run dev
```

## Features

- 3 subjects: Physics, Chemistry, Math
- 5 levels per subject (locked until previous level completed)
- 3 questions per level
- Russian / English language toggle
- User registration & login (JWT)
- Progress saved to PostgreSQL
- Score system (50 points per correct answer)
- Leaderboard
- Offline mode (localStorage fallback when no backend)

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/register | — | Create account |
| POST | /api/login | — | Login |
| GET | /api/profile | ✓ | Get user + progress |
| POST | /api/progress | ✓ | Save level completion |
| GET | /api/leaderboard | — | Top 20 players |
| GET | /api/health | — | Health check |
