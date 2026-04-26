from flask import Blueprint, request, jsonify

quiz_bp = Blueprint('quiz', __name__)

# Вопросы для викторины
QUIZ_QUESTIONS = {
    'easy': [
        {'id': 1, 'question': 'What is the chemical symbol for Gold?', 'options': ['Au', 'Ag', 'Fe', 'Cu'], 'correct': 0},
        {'id': 2, 'question': 'H₂O is?', 'options': ['Water', 'Oxygen', 'Hydrogen', 'Salt'], 'correct': 0},
        {'id': 3, 'question': 'pH of pure water?', 'options': ['7', '0', '14', '5'], 'correct': 0},
        {'id': 4, 'question': 'Lightest element?', 'options': ['Hydrogen', 'Helium', 'Oxygen', 'Carbon'], 'correct': 0},
        {'id': 5, 'question': 'Plants absorb?', 'options': ['CO₂', 'O₂', 'N₂', 'H₂'], 'correct': 0},
        {'id': 6, 'question': 'What gas do we breathe?', 'options': ['Oxygen', 'CO₂', 'Nitrogen', 'Hydrogen'], 'correct': 0},
        {'id': 7, 'question': 'What is the chemical symbol for Iron?', 'options': ['Fe', 'Ir', 'In', 'I'], 'correct': 0},
        {'id': 8, 'question': 'What is the chemical symbol for Silver?', 'options': ['Ag', 'Si', 'Sv', 'Sl'], 'correct': 0},
        {'id': 9, 'question': 'What makes soda fizzy?', 'options': ['CO₂', 'O₂', 'N₂', 'H₂'], 'correct': 0},
        {'id': 10, 'question': 'What is the most common element in universe?', 'options': ['Hydrogen', 'Helium', 'Oxygen', 'Carbon'], 'correct': 0},
    ],
    'medium': [
        {'id': 11, 'question': 'Atomic number of Carbon?', 'options': ['6', '4', '8', '12'], 'correct': 0},
        {'id': 12, 'question': 'Table salt formula?', 'options': ['NaCl', 'KCl', 'CaCl₂', 'MgCl₂'], 'correct': 0},
        {'id': 13, 'question': 'Noble gas?', 'options': ['Neon', 'Oxygen', 'Nitrogen', 'Chlorine'], 'correct': 0},
        {'id': 14, 'question': 'Rusting is?', 'options': ['Oxidation', 'Reduction', 'Combustion', 'Melting'], 'correct': 0},
        {'id': 15, 'question': 'Covalent bond shares?', 'options': ['Electrons', 'Protons', 'Neutrons', 'Ions'], 'correct': 0},
    ],
    'hard': [
        {'id': 16, 'question': "Avogadro's number?", 'options': ['6.02e23', '3.14e23', '1.61e23', '9.81e23'], 'correct': 0},
        {'id': 17, 'question': 'Highest electronegativity?', 'options': ['Fluorine', 'Oxygen', 'Chlorine', 'Nitrogen'], 'correct': 0},
        {'id': 18, 'question': 'Methane hybridization?', 'options': ['sp³', 'sp', 'sp²', 'sp³d'], 'correct': 0},
        {'id': 19, 'question': 'pH of 0.1M HCl?', 'options': ['1', '2', '3', '4'], 'correct': 0},
        {'id': 20, 'question': 'Quantum number for shape?', 'options': ['l', 'n', 'm', 's'], 'correct': 0},
    ]
}

@quiz_bp.route('/questions/<difficulty>', methods=['GET'])
def get_quiz_questions(difficulty):
    questions = QUIZ_QUESTIONS.get(difficulty, QUIZ_QUESTIONS['easy'])
    return jsonify({'questions': questions[:10]})

@quiz_bp.route('/answer', methods=['POST'])
def check_quiz_answer():
    data = request.json
    question_id = data.get('question_id')
    answer = data.get('answer')
    difficulty = data.get('difficulty', 'easy')
    
    questions = QUIZ_QUESTIONS.get(difficulty, QUIZ_QUESTIONS['easy'])
    question = next((q for q in questions if q['id'] == question_id), None)
    
    if question:
        is_correct = (question['correct'] == answer)
        return jsonify({
            'correct': is_correct,
            'correct_answer': question['options'][question['correct']],
            'explanation': 'Correct!' if is_correct else f'Wrong! Correct: {question["options"][question["correct"]]}'
        })
    return jsonify({'error': 'Question not found'}), 404