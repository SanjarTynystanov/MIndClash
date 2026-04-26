# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
# import sqlite3
# import os

# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})
# app.config['JWT_SECRET_KEY'] = 'sciquest-super-secret-key-2024'
# jwt = JWTManager(app)

# DB_PATH = os.path.join(os.path.dirname(__file__), 'sciquest.db')

# def init_db():
#     conn = sqlite3.connect(DB_PATH)
#     c = conn.cursor()
#     c.execute('''CREATE TABLE IF NOT EXISTS users (
#         id INTEGER PRIMARY KEY AUTOINCREMENT,
#         username TEXT UNIQUE NOT NULL,
#         password TEXT NOT NULL,
#         xp INTEGER DEFAULT 0,
#         level INTEGER DEFAULT 1,
#         streak INTEGER DEFAULT 0,
#         highest_streak INTEGER DEFAULT 0
#     )''')
#     c.execute('''CREATE TABLE IF NOT EXISTS game_progress (
#         id INTEGER PRIMARY KEY AUTOINCREMENT,
#         user_id INTEGER,
#         subject TEXT,
#         difficulty TEXT,
#         level_completed INTEGER DEFAULT 0,
#         FOREIGN KEY (user_id) REFERENCES users (id),
#         UNIQUE(user_id, subject, difficulty)
#     )''')
#     c.execute('''CREATE TABLE IF NOT EXISTS game_stats (
#         id INTEGER PRIMARY KEY AUTOINCREMENT,
#         user_id INTEGER,
#         subject TEXT,
#         total_games INTEGER DEFAULT 0,
#         total_wins INTEGER DEFAULT 0,
#         total_perfect_games INTEGER DEFAULT 0,
#         FOREIGN KEY (user_id) REFERENCES users (id),
#         UNIQUE(user_id, subject)
#     )''')
#     conn.commit()
#     conn.close()
#     print("✅ Database initialized")

# init_db()

# # ============ AUTH ROUTES ============
# @app.route('/api/register', methods=['POST'])
# def register():
#     data = request.json
#     username = data.get('username')
#     password = data.get('password')
    
#     conn = sqlite3.connect(DB_PATH)
#     c = conn.cursor()
#     try:
#         c.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
#         user_id = c.lastrowid
#         conn.commit()
#         token = create_access_token(identity=str(user_id))
#         return jsonify({
#             'token': token, 
#             'user': {
#                 'id': user_id, 
#                 'username': username, 
#                 'xp': 0, 
#                 'level': 1, 
#                 'streak': 0
#             }
#         })
#     except sqlite3.IntegrityError:
#         return jsonify({'error': 'Username exists'}), 400
#     finally:
#         conn.close()

# @app.route('/api/login', methods=['POST'])
# def login():
#     data = request.json
#     username = data.get('username')
#     password = data.get('password')
    
#     conn = sqlite3.connect(DB_PATH)
#     c = conn.cursor()
#     c.execute('SELECT id, username, xp, level, streak FROM users WHERE username = ? AND password = ?', (username, password))
#     user = c.fetchone()
#     conn.close()
    
#     if user:
#         token = create_access_token(identity=str(user[0]))
#         return jsonify({
#             'token': token, 
#             'user': {
#                 'id': user[0], 
#                 'username': user[1], 
#                 'xp': user[2], 
#                 'level': user[3], 
#                 'streak': user[4]
#             }
#         })
#     return jsonify({'error': 'Invalid credentials'}), 401

# @app.route('/api/profile', methods=['GET'])
# @jwt_required()
# def profile():
#     user_id = get_jwt_identity()
#     conn = sqlite3.connect(DB_PATH)
#     c = conn.cursor()
#     c.execute('SELECT id, username, xp, level, streak, highest_streak FROM users WHERE id = ?', (user_id,))
#     user = c.fetchone()
    
#     if not user:
#         return jsonify({'error': 'User not found'}), 404
    
#     c.execute('SELECT subject, difficulty, level_completed FROM game_progress WHERE user_id = ?', (user[0],))
#     progress_rows = c.fetchall()
#     progress = {f"{row[0]}_{row[1]}": row[2] for row in progress_rows}
    
#     c.execute('SELECT subject, total_games, total_wins, total_perfect_games FROM game_stats WHERE user_id = ?', (user[0],))
#     stats_rows = c.fetchall()
#     stats = {'total_games': 0, 'total_wins': 0, 'total_perfect_games': 0}
#     for row in stats_rows:
#         stats['total_games'] += row[1] or 0
#         stats['total_wins'] += row[2] or 0
#         stats['total_perfect_games'] += row[3] or 0
    
#     conn.close()
#     return jsonify({
#         'user': {
#             'id': user[0], 
#             'username': user[1], 
#             'xp': user[2], 
#             'level': user[3], 
#             'streak': user[4],
#             'highest_streak': user[5],
#             'xpNeededForNext': 100
#         },
#         'progress': progress,
#         'stats': stats
#     })

# @app.route('/api/update-progress', methods=['POST'])
# @jwt_required()
# def update_progress():
#     user_id = get_jwt_identity()
#     data = request.json
#     subject = data.get('subject')
#     difficulty = data.get('difficulty')
#     completed = data.get('completed', False)
#     perfect = data.get('perfect', False)
    
#     print(f"📊 Saving: user={user_id}, {subject}/{difficulty}, win={completed}, perfect={perfect}")
    
#     conn = sqlite3.connect(DB_PATH)
#     c = conn.cursor()
    
#     c.execute('SELECT id, xp, level, streak, highest_streak FROM users WHERE id = ?', (user_id,))
#     user = c.fetchone()
    
#     if completed:
#         c.execute('''INSERT INTO game_progress (user_id, subject, difficulty, level_completed) 
#                      VALUES (?, ?, ?, 1)
#                      ON CONFLICT(user_id, subject, difficulty) 
#                      DO UPDATE SET level_completed = level_completed + 1''', (user[0], subject, difficulty))
    
#     c.execute('''INSERT INTO game_stats (user_id, subject, total_games, total_wins, total_perfect_games) 
#                  VALUES (?, ?, 1, ?, ?)
#                  ON CONFLICT(user_id, subject) 
#                  DO UPDATE SET 
#                     total_games = total_games + 1,
#                     total_wins = total_wins + ?,
#                     total_perfect_games = total_perfect_games + ?''',
#               (user[0], subject, 1 if completed else 0, 1 if perfect else 0,
#                1 if completed else 0, 1 if perfect else 0))
    
#     xp_gain = (10 if completed else 0) + (5 if perfect else 0)
#     new_xp = user[2] + xp_gain
#     new_level = 1 + (new_xp // 100)
#     new_streak = user[3] + 1 if completed else 0
#     new_highest_streak = max(user[4], new_streak)
    
#     c.execute('UPDATE users SET xp = ?, level = ?, streak = ?, highest_streak = ? WHERE id = ?', 
#               (new_xp, new_level, new_streak, new_highest_streak, user[0]))
#     conn.commit()
#     conn.close()
    
#     print(f"✅ Saved: +{xp_gain} XP, new level={new_level}")
#     return jsonify({
#         'success': True, 
#         'xp_gain': xp_gain, 
#         'new_xp': new_xp, 
#         'new_level': new_level,
#         'new_streak': new_streak
#     })

# @app.route('/api/leaderboard', methods=['GET'])
# def leaderboard():
#     conn = sqlite3.connect(DB_PATH)
#     c = conn.cursor()
#     c.execute('SELECT username, xp FROM users ORDER BY xp DESC LIMIT 10')
#     leaders = c.fetchall()
#     conn.close()
#     return jsonify([{'username': l[0], 'total_score': l[1]} for l in leaders])

# if __name__ == '__main__':
#     print("\n" + "="*50)
#     print("🚀 SciQuest Backend Running!")
#     print("📍 http://localhost:3001")
#     print("="*50)
#     app.run(port=3001, debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import sqlite3
import os
import random

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}})
app.config['JWT_SECRET_KEY'] = 'sciquest-super-secret-key-2024'
jwt = JWTManager(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'sciquest.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        streak INTEGER DEFAULT 0,
        highest_streak INTEGER DEFAULT 0
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS game_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        subject TEXT,
        difficulty TEXT,
        level_completed INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, subject, difficulty)
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS game_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        subject TEXT,
        total_games INTEGER DEFAULT 0,
        total_wins INTEGER DEFAULT 0,
        total_perfect_games INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, subject)
    )''')
    conn.commit()
    conn.close()
    print("✅ Database initialized")

init_db()

# ============ AUTH ============
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
        user_id = c.lastrowid
        conn.commit()
        token = create_access_token(identity=str(user_id))
        return jsonify({'token': token, 'user': {'id': user_id, 'username': username, 'xp': 0, 'level': 1, 'streak': 0}})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username exists'}), 400
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, username, xp, level, streak FROM users WHERE username = ? AND password = ?', (username, password))
    user = c.fetchone()
    conn.close()
    if user:
        token = create_access_token(identity=str(user[0]))
        return jsonify({'token': token, 'user': {'id': user[0], 'username': user[1], 'xp': user[2], 'level': user[3], 'streak': user[4]}})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, username, xp, level, streak, highest_streak FROM users WHERE id = ?', (user_id,))
    user = c.fetchone()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    c.execute('SELECT subject, difficulty, level_completed FROM game_progress WHERE user_id = ?', (user[0],))
    progress = {f"{row[0]}_{row[1]}": row[2] for row in c.fetchall()}
    c.execute('SELECT subject, total_games, total_wins, total_perfect_games FROM game_stats WHERE user_id = ?', (user[0],))
    stats_rows = c.fetchall()
    stats = {'total_games': 0, 'total_wins': 0, 'total_perfect_games': 0}
    for row in stats_rows:
        stats['total_games'] += row[1] or 0
        stats['total_wins'] += row[2] or 0
        stats['total_perfect_games'] += row[3] or 0
    conn.close()
    return jsonify({
        'user': {'id': user[0], 'username': user[1], 'xp': user[2], 'level': user[3], 'streak': user[4], 'highest_streak': user[5], 'xpNeededForNext': 100},
        'progress': progress,
        'stats': stats
    })

@app.route('/api/update-progress', methods=['POST'])
@jwt_required()
def update_progress():
    user_id = get_jwt_identity()
    data = request.json
    subject = data.get('subject')
    difficulty = data.get('difficulty')
    completed = data.get('completed', False)
    perfect = data.get('perfect', False)
    print(f"📊 Saving: user={user_id}, {subject}/{difficulty}, win={completed}")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, xp, level, streak, highest_streak FROM users WHERE id = ?', (user_id,))
    user = c.fetchone()
    if completed:
        c.execute('''INSERT INTO game_progress (user_id, subject, difficulty, level_completed) VALUES (?, ?, ?, 1)
                     ON CONFLICT(user_id, subject, difficulty) DO UPDATE SET level_completed = level_completed + 1''', (user[0], subject, difficulty))
    c.execute('''INSERT INTO game_stats (user_id, subject, total_games, total_wins, total_perfect_games) VALUES (?, ?, 1, ?, ?)
                 ON CONFLICT(user_id, subject) DO UPDATE SET total_games = total_games + 1, total_wins = total_wins + ?, total_perfect_games = total_perfect_games + ?''',
              (user[0], subject, 1 if completed else 0, 1 if perfect else 0, 1 if completed else 0, 1 if perfect else 0))
    xp_gain = (10 if completed else 0) + (5 if perfect else 0)
    new_xp = user[2] + xp_gain
    new_level = 1 + (new_xp // 100)
    new_streak = user[3] + 1 if completed else 0
    c.execute('UPDATE users SET xp = ?, level = ?, streak = ? WHERE id = ?', (new_xp, new_level, new_streak, user[0]))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'xp_gain': xp_gain, 'new_xp': new_xp, 'new_level': new_level})

@app.route('/api/leaderboard', methods=['GET'])
def leaderboard():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT username, xp FROM users ORDER BY xp DESC LIMIT 10')
    leaders = c.fetchall()
    conn.close()
    return jsonify([{'username': l[0], 'total_score': l[1]} for l in leaders])

# ============ QUIZ (5 вопросов) ============
QUIZ_QUESTIONS = {
    'easy': [
        {'id': 1, 'question': 'What is the symbol for Gold?', 'options': ['Au', 'Ag', 'Fe', 'Cu'], 'correct': 0},
        {'id': 2, 'question': 'What is H₂O?', 'options': ['Water', 'Oxygen', 'Hydrogen', 'Salt'], 'correct': 0},
        {'id': 3, 'question': 'What is the pH of pure water?', 'options': ['7', '0', '14', '5'], 'correct': 0},
        {'id': 4, 'question': 'Which is the lightest element?', 'options': ['Hydrogen', 'Helium', 'Oxygen', 'Carbon'], 'correct': 0},
        {'id': 5, 'question': 'What gas do plants absorb?', 'options': ['CO₂', 'O₂', 'N₂', 'H₂'], 'correct': 0},
    ],
    'medium': [
        {'id': 6, 'question': 'Atomic number of Carbon?', 'options': ['6', '4', '8', '12'], 'correct': 0},
        {'id': 7, 'question': 'What is the formula for salt?', 'options': ['NaCl', 'KCl', 'CaCl₂', 'MgCl₂'], 'correct': 0},
        {'id': 8, 'question': 'Which is a noble gas?', 'options': ['Neon', 'Oxygen', 'Nitrogen', 'Chlorine'], 'correct': 0},
        {'id': 9, 'question': 'What is rusting?', 'options': ['Oxidation', 'Reduction', 'Combustion', 'Melting'], 'correct': 0},
        {'id': 10, 'question': 'Covalent bonds share?', 'options': ['Electrons', 'Protons', 'Neutrons', 'Ions'], 'correct': 0},
    ],
    'hard': [
        {'id': 11, 'question': "Avogadro's number?", 'options': ['6.02e23', '3.14e23', '1.61e23', '9.81e23'], 'correct': 0},
        {'id': 12, 'question': 'Highest electronegativity?', 'options': ['Fluorine', 'Oxygen', 'Chlorine', 'Nitrogen'], 'correct': 0},
        {'id': 13, 'question': 'Methane hybridization?', 'options': ['sp³', 'sp', 'sp²', 'sp³d'], 'correct': 0},
        {'id': 14, 'question': 'pH of 0.1M HCl?', 'options': ['1', '2', '3', '4'], 'correct': 0},
        {'id': 15, 'question': 'Quantum number for shape?', 'options': ['l', 'n', 'm', 's'], 'correct': 0},
    ]
}

@app.route('/api/quiz/questions/<difficulty>', methods=['GET'])
def get_quiz(difficulty):
    return jsonify({'questions': QUIZ_QUESTIONS.get(difficulty, QUIZ_QUESTIONS['easy'])})

@app.route('/api/quiz/answer', methods=['POST'])
def check_quiz():
    data = request.json
    qid = data.get('question_id')
    answer = data.get('answer')
    diff = data.get('difficulty', 'easy')
    questions = QUIZ_QUESTIONS.get(diff, QUIZ_QUESTIONS['easy'])
    q = next((x for x in questions if x['id'] == qid), None)
    if q:
        is_correct = (q['correct'] == answer)
        return jsonify({'correct': is_correct, 'correct_answer': q['options'][q['correct']]})
    return jsonify({'error': 'Not found'}), 404

# ============ CHEMISTRY GAME ============
CHEM_LEVELS = {
    1: {'name': 'Water', 'formula': 'H₂O', 'components': [['H', 2], ['O', 1]], 'fact': '💧 Water is life'},
    2: {'name': 'CO₂', 'formula': 'CO₂', 'components': [['C', 1], ['O', 2]], 'fact': '🌿 Plants need CO₂'},
    3: {'name': 'Methane', 'formula': 'CH₄', 'components': [['C', 1], ['H', 4]], 'fact': '🔥 Natural gas'},
}
ELEMENTS = {'H': {'emoji': '💧'}, 'O': {'emoji': '⚪'}, 'C': {'emoji': '⚫'}, 'Na': {'emoji': '🧂'}, 'Cl': {'emoji': '🧪'}}

@app.route('/api/chemistry/game/<difficulty>/<int:level>', methods=['GET'])
def chem_game(difficulty, level):
    data = CHEM_LEVELS.get(level, CHEM_LEVELS[1])
    return jsonify({'type': 'builder', 'data': data, 'elements': ELEMENTS, 'timeLimit': 20})

@app.route('/api/chemistry/check', methods=['POST'])
def chem_check():
    data = request.json
    answer = data.get('answer')
    level = data.get('level', 1)
    correct = CHEM_LEVELS.get(level, CHEM_LEVELS[1]).get('formula')
    return jsonify({'correct': answer == correct, 'correct_answer': correct})

# ============ MATH GAME ============
MATH_LEVELS = {
    1: {'question': '5 + 3 = ?', 'options': [6, 7, 8, 9], 'answer': 8},
    2: {'question': '12 - 4 = ?', 'options': [6, 7, 8, 9], 'answer': 8},
    3: {'question': '7 × 3 = ?', 'options': [18, 20, 21, 24], 'answer': 21},
}
@app.route('/api/math/game/<difficulty>/<int:level>', methods=['GET'])
def math_game(difficulty, level):
    data = MATH_LEVELS.get(level, MATH_LEVELS[1])
    return jsonify({'type': 'math', 'question': data['question'], 'options': data['options'], 'timeLimit': 20})
@app.route('/api/math/check', methods=['POST'])
def math_check():
    data = request.json
    level = data.get('level', 1)
    answer = data.get('answer')
    correct = MATH_LEVELS.get(level, MATH_LEVELS[1]).get('answer')
    return jsonify({'correct': answer == correct, 'correct_answer': correct})

# ============ PHYSICS GAME ============
PHYSICS_LEVELS = {
    1: {'question': 'Unit of force?', 'options': ['Joule', 'Watt', 'Newton', 'Pascal'], 'answer': 2},
    2: {'question': 'Gravity on Earth?', 'options': ['9.8', '8.9', '10.8', '7.8'], 'answer': 0},
    3: {'question': 'Speed formula?', 'options': ['d/t', 't/d', 'd*t', 'm/a'], 'answer': 0},
}
@app.route('/api/physics/game/<difficulty>/<int:level>', methods=['GET'])
def physics_game(difficulty, level):
    data = PHYSICS_LEVELS.get(level, PHYSICS_LEVELS[1])
    return jsonify({'type': 'physics', 'question': data['question'], 'options': data['options'], 'timeLimit': 20})
@app.route('/api/physics/check', methods=['POST'])
def physics_check():
    data = request.json
    level = data.get('level', 1)
    answer = data.get('answer')
    correct = PHYSICS_LEVELS.get(level, PHYSICS_LEVELS[1]).get('answer')
    return jsonify({'correct': answer == correct, 'correct_answer': correct})

if __name__ == '__main__':
    print("\n🚀 Server running on http://localhost:3001")
    app.run(port=3001, debug=True)