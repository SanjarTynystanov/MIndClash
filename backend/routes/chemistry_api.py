from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# ============ EASY LEVELS (1-10) - Сборка молекул ============
EASY_LEVELS = {
    1: {'name': 'Water', 'formula': 'H₂O', 'components': [('H', 2), ('O', 1)], 'fact': '💧 Вода основа жизни'},
    2: {'name': 'Carbon Dioxide', 'formula': 'CO₂', 'components': [('C', 1), ('O', 2)], 'fact': '🌿 CO₂ нужен растениям'},
    3: {'name': 'Methane', 'formula': 'CH₄', 'components': [('C', 1), ('H', 4)], 'fact': '🔥 Природный газ'},
    4: {'name': 'Ammonia', 'formula': 'NH₃', 'components': [('N', 1), ('H', 3)], 'fact': '🧹 Чистящие средства'},
    5: {'name': 'Sodium Chloride', 'formula': 'NaCl', 'components': [('Na', 1), ('Cl', 1)], 'fact': '🧂 Поваренная соль'},
    6: {'name': 'Hydrochloric Acid', 'formula': 'HCl', 'components': [('H', 1), ('Cl', 1)], 'fact': '⚠️ Желудочный сок'},
    7: {'name': 'Hydrogen Peroxide', 'formula': 'H₂O₂', 'components': [('H', 2), ('O', 2)], 'fact': '🩹 Антисептик'},
    8: {'name': 'Sulfuric Acid', 'formula': 'H₂SO₄', 'components': [('H', 2), ('S', 1), ('O', 4)], 'fact': '🏭 Важнейший химикат'},
    9: {'name': 'Ethanol', 'formula': 'C₂H₅OH', 'components': [('C', 2), ('H', 6), ('O', 1)], 'fact': '🍷 Спирт'},
    10: {'name': 'Glucose', 'formula': 'C₆H₁₂O₆', 'components': [('C', 6), ('H', 12), ('O', 6)], 'fact': '🍬 Энергия для тела'}
}

# ============ MEDIUM LEVELS (1-10) - Уравнивание реакций ============
MEDIUM_LEVELS = {
    1: {'equation': '___ H₂ + ___ O₂ → ___ H₂O', 'coefficients': [2, 1, 2], 'theory': '2H₂ + O₂ → 2H₂O'},
    2: {'equation': '___ Na + ___ Cl₂ → ___ NaCl', 'coefficients': [2, 1, 2], 'theory': '2Na + Cl₂ → 2NaCl'},
    3: {'equation': '___ N₂ + ___ H₂ → ___ NH₃', 'coefficients': [1, 3, 2], 'theory': 'N₂ + 3H₂ → 2NH₃'},
    4: {'equation': '___ CH₄ + ___ O₂ → ___ CO₂ + ___ H₂O', 'coefficients': [1, 2, 1, 2], 'theory': 'CH₄ + 2O₂ → CO₂ + 2H₂O'},
    5: {'equation': '___ Fe + ___ O₂ → ___ Fe₂O₃', 'coefficients': [4, 3, 2], 'theory': '4Fe + 3O₂ → 2Fe₂O₃'},
    6: {'equation': '___ Al + ___ O₂ → ___ Al₂O₃', 'coefficients': [4, 3, 2], 'theory': '4Al + 3O₂ → 2Al₂O₃'},
    7: {'equation': '___ Ca + ___ H₂O → ___ Ca(OH)₂ + ___ H₂', 'coefficients': [1, 2, 1, 1], 'theory': 'Ca + 2H₂O → Ca(OH)₂ + H₂'},
    8: {'equation': '___ Mg + ___ HCl → ___ MgCl₂ + ___ H₂', 'coefficients': [1, 2, 1, 1], 'theory': 'Mg + 2HCl → MgCl₂ + H₂'},
    9: {'equation': '___ NaOH + ___ H₂SO₄ → ___ Na₂SO₄ + ___ H₂O', 'coefficients': [2, 1, 1, 2], 'theory': '2NaOH + H₂SO₄ → Na₂SO₄ + 2H₂O'},
    10: {'equation': '___ C₃H₈ + ___ O₂ → ___ CO₂ + ___ H₂O', 'coefficients': [1, 5, 3, 4], 'theory': 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O'}
}

# ============ HARD LEVELS (1-10) - Предсказание реакции ============
HARD_LEVELS = {
    1: {'reactants': ['Na', 'Cl₂'], 'correct': 'NaCl', 'distractors': ['NaCl₂', 'Na₂Cl', 'NaO'], 'theory': '2Na + Cl₂ → 2NaCl'},
    2: {'reactants': ['H₂', 'O₂'], 'correct': 'H₂O', 'distractors': ['H₂O₂', 'HO', 'H₃O'], 'theory': '2H₂ + O₂ → 2H₂O'},
    3: {'reactants': ['C', 'O₂'], 'correct': 'CO₂', 'distractors': ['CO', 'C₂O', 'CO₃'], 'theory': 'C + O₂ → CO₂'},
    4: {'reactants': ['Fe', 'O₂'], 'correct': 'Fe₂O₃', 'distractors': ['FeO', 'Fe₃O₄', 'Fe₂O'], 'theory': '4Fe + 3O₂ → 2Fe₂O₃'},
    5: {'reactants': ['Ca', 'H₂O'], 'correct': 'Ca(OH)₂', 'distractors': ['CaOH', 'CaO', 'CaH₂'], 'theory': 'Ca + 2H₂O → Ca(OH)₂ + H₂'},
    6: {'reactants': ['Mg', 'HCl'], 'correct': 'MgCl₂', 'distractors': ['MgCl', 'Mg₂Cl', 'MgO'], 'theory': 'Mg + 2HCl → MgCl₂ + H₂'},
    7: {'reactants': ['NaOH', 'H₂SO₄'], 'correct': 'Na₂SO₄', 'distractors': ['NaSO₄', 'Na₂SO₃', 'Na₂S'], 'theory': '2NaOH + H₂SO₄ → Na₂SO₄ + 2H₂O'},
    8: {'reactants': ['Al', 'O₂'], 'correct': 'Al₂O₃', 'distractors': ['AlO', 'Al₂O', 'Al₃O₂'], 'theory': '4Al + 3O₂ → 2Al₂O₃'},
    9: {'reactants': ['CH₄', 'O₂'], 'correct': 'CO₂', 'distractors': ['CO', 'CH₂O', 'C₂H₅OH'], 'theory': 'CH₄ + 2O₂ → CO₂ + 2H₂O'},
    10: {'reactants': ['S', 'O₂', 'H₂O'], 'correct': 'H₂SO₄', 'distractors': ['H₂SO₃', 'H₂S', 'SO₂'], 'theory': 'S → SO₂ → SO₃ → H₂SO₄'}
}

# Химические элементы для визуализации
ELEMENTS = {
    'H': {'name': 'Hydrogen', 'color': '#4fc3f7', 'emoji': '💧'},
    'O': {'name': 'Oxygen', 'color': '#e94560', 'emoji': '⚪'},
    'C': {'name': 'Carbon', 'color': '#555', 'emoji': '⚫'},
    'Na': {'name': 'Sodium', 'color': '#FAC775', 'emoji': '🧂'},
    'Cl': {'name': 'Chlorine', 'color': '#4caf50', 'emoji': '🧪'},
    'N': {'name': 'Nitrogen', 'color': '#2196f3', 'emoji': '🌬️'},
    'Ca': {'name': 'Calcium', 'color': '#ff9800', 'emoji': '🦴'},
    'Fe': {'name': 'Iron', 'color': '#9c27b0', 'emoji': '🔩'},
    'Mg': {'name': 'Magnesium', 'color': '#00bcd4', 'emoji': '✨'},
    'Al': {'name': 'Aluminum', 'color': '#b0bec5', 'emoji': '🛸'},
    'S': {'name': 'Sulfur', 'color': '#ffeb3b', 'emoji': '💛'}
}

@app.route('/api/chemistry/challenge/<difficulty>/<int:level>', methods=['GET'])
def get_challenge(difficulty, level):
    if difficulty == 'easy':
        return jsonify({'type': 'builder', 'data': EASY_LEVELS.get(level, EASY_LEVELS[1]), 'elements': ELEMENTS, 'timeLimit': 30})
    elif difficulty == 'medium':
        return jsonify({'type': 'balancer', 'data': MEDIUM_LEVELS.get(level, MEDIUM_LEVELS[1]), 'timeLimit': 45})
    else:
        data = HARD_LEVELS.get(level, HARD_LEVELS[1])
        options = [data['correct']] + data['distractors']
        random.shuffle(options)
        return jsonify({'type': 'predictor', 'data': data, 'options': options, 'timeLimit': 60})

@app.route('/api/chemistry/check', methods=['POST'])
def check_answer():
    data = request.json
    difficulty = data.get('difficulty')
    level = data.get('level')
    answer = data.get('answer')
    
    if difficulty == 'easy':
        correct = EASY_LEVELS.get(level, {}).get('formula')
        is_correct = answer == correct
    elif difficulty == 'medium':
        correct = MEDIUM_LEVELS.get(level, {}).get('coefficients')
        is_correct = answer == correct
    else:
        correct = HARD_LEVELS.get(level, {}).get('correct')
        is_correct = answer == correct
    
    return jsonify({
        'correct': is_correct,
        'correct_answer': correct,
        'theory': MEDIUM_LEVELS.get(level, {}).get('theory', '') if difficulty == 'medium' else HARD_LEVELS.get(level, {}).get('theory', '')
    })

if __name__ == '__main__':
    print("🧪 Chemistry API running on http://localhost:3001")
    app.run(port=3001, debug=True)