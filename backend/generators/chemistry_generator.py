import random
import json
from typing import Dict, List, Tuple

class ChemistryGenerator:
    def __init__(self):
        self.chemicals = {
            'H': {'name': 'Hydrogen', 'color': '#4fc3f7', 'emoji': '💧', 'type': 'nonmetal'},
            'O': {'name': 'Oxygen', 'color': '#e94560', 'emoji': '⚪', 'type': 'nonmetal'},
            'C': {'name': 'Carbon', 'color': '#555', 'emoji': '⚫', 'type': 'nonmetal'},
            'Na': {'name': 'Sodium', 'color': '#FAC775', 'emoji': '🧂', 'type': 'metal'},
            'Cl': {'name': 'Chlorine', 'color': '#4caf50', 'emoji': '🧪', 'type': 'nonmetal'},
            'N': {'name': 'Nitrogen', 'color': '#2196f3', 'emoji': '🌬️', 'type': 'nonmetal'},
            'Ca': {'name': 'Calcium', 'color': '#ff9800', 'emoji': '🦴', 'type': 'metal'},
            'Fe': {'name': 'Iron', 'color': '#9c27b0', 'emoji': '🔩', 'type': 'metal'},
            'Mg': {'name': 'Magnesium', 'color': '#00bcd4', 'emoji': '✨', 'type': 'metal'},
            'Al': {'name': 'Aluminum', 'color': '#b0bec5', 'emoji': '🛸', 'type': 'metal'},
            'S': {'name': 'Sulfur', 'color': '#ffeb3b', 'emoji': '💛', 'type': 'nonmetal'},
        }
        
    # ============ EASY LEVELS (1-10) - Molecule Builder ============
    def get_easy_challenge(self, level: int) -> Dict:
        """Генерация задач для Easy сложности (сборка молекул)"""
        challenges = {
            1: {'name': 'Water', 'formula': 'H2O', 'components': [('H', 2), ('O', 1)], 
                'fact': '💧 Water is essential for life!', 'hint': 'H2O - два водорода и один кислород'},
            2: {'name': 'Carbon Dioxide', 'formula': 'CO2', 'components': [('C', 1), ('O', 2)],
                'fact': '🌿 Plants use CO2 for photosynthesis', 'hint': 'CO2 - один углерод, два кислорода'},
            3: {'name': 'Methane', 'formula': 'CH4', 'components': [('C', 1), ('H', 4)],
                'fact': '🔥 Methane is natural gas', 'hint': 'CH4 - один углерод, четыре водорода'},
            4: {'name': 'Ammonia', 'formula': 'NH3', 'components': [('N', 1), ('H', 3)],
                'fact': '🧹 Ammonia is used in cleaning products', 'hint': 'NH3 - один азот, три водорода'},
            5: {'name': 'Sodium Chloride', 'formula': 'NaCl', 'components': [('Na', 1), ('Cl', 1)],
                'fact': '🧂 Table salt! Essential for cooking', 'hint': 'NaCl - один натрий, один хлор'},
            6: {'name': 'Glucose', 'formula': 'C6H12O6', 'components': [('C', 6), ('H', 12), ('O', 6)],
                'fact': '🍬 Sugar - energy for your body', 'hint': 'C6H12O6 - 6 углерода, 12 водорода, 6 кислорода'},
            7: {'name': 'Hydrochloric Acid', 'formula': 'HCl', 'components': [('H', 1), ('Cl', 1)],
                'fact': '⚠️ Stomach acid helps digest food', 'hint': 'HCl - водород + хлор'},
            8: {'name': 'Sulfuric Acid', 'formula': 'H2SO4', 'components': [('H', 2), ('S', 1), ('O', 4)],
                'fact': '🏭 Most produced industrial chemical', 'hint': 'H2SO4 - 2H + S + 4O'},
            9: {'name': 'Ethanol', 'formula': 'C2H5OH', 'components': [('C', 2), ('H', 6), ('O', 1)],
                'fact': '🍷 Alcohol in beverages', 'hint': 'C2H5OH - 2C + 6H + O'},
            10: {'name': 'Hydrogen Peroxide', 'formula': 'H2O2', 'components': [('H', 2), ('O', 2)],
                'fact': '🩹 Used as disinfectant', 'hint': 'H2O2 - два водорода, два кислорода'}
        }
        return challenges.get(level, challenges[1])
    
    # ============ MEDIUM LEVELS (1-10) - Balancing Equations ============
    def get_medium_challenge(self, level: int) -> Dict:
        """Генерация задач для Medium сложности (уравнивание)"""
        equations = {
            1: {'equation': '__H2 + __O2 ➜ __H2O', 'coefficients': [2, 1, 2],
                'theory': '💡 Слева 2H2 + O2 (4H + 2O), справа 2H2O (4H + 2O)',
                'explanation': 'Водород: 2×2=4, Кислород: 1×2=2 → 2H2O имеет 4H и 2O'},
            2: {'equation': '__Na + __Cl2 ➜ __NaCl', 'coefficients': [2, 1, 2],
                'theory': '💡 Натрий отдает 1 электрон, хлор принимает → NaCl',
                'explanation': '2Na + Cl2 → 2NaCl (баланс: 2Na, 2Cl)'},
            3: {'equation': '__N2 + __H2 ➜ __NH3', 'coefficients': [1, 3, 2],
                'theory': '💡 Азот 3-х валентен, водород 1-валентен',
                'explanation': 'N2 + 3H2 → 2NH3 (2N + 6H → 2N + 6H)'},
            4: {'equation': '__CH4 + __O2 ➜ __CO2 + __H2O', 'coefficients': [1, 2, 1, 2],
                'theory': '🔥 Полное сгорание метана',
                'explanation': 'CH4 + 2O2 → CO2 + 2H2O'},
            5: {'equation': '__Fe + __O2 ➜ __Fe2O3', 'coefficients': [4, 3, 2],
                'theory': '🦾 Ржавление железа',
                'explanation': '4Fe + 3O2 → 2Fe2O3'},
            6: {'equation': '__C + __O2 ➜ __CO2', 'coefficients': [1, 1, 1],
                'theory': '🔥 Горение углерода',
                'explanation': 'C + O2 → CO2'},
            7: {'equation': '__Al + __O2 ➜ __Al2O3', 'coefficients': [4, 3, 2],
                'theory': '✨ Алюминий на воздухе покрывается оксидной пленкой',
                'explanation': '4Al + 3O2 → 2Al2O3'},
            8: {'equation': '__Ca + __H2O ➜ __Ca(OH)2 + __H2', 'coefficients': [1, 2, 1, 1],
                'theory': '💧 Реакция кальция с водой',
                'explanation': 'Ca + 2H2O → Ca(OH)2 + H2'},
            9: {'equation': '__Mg + __HCl ➜ __MgCl2 + __H2', 'coefficients': [1, 2, 1, 1],
                'theory': '🧪 Реакция магния с кислотой',
                'explanation': 'Mg + 2HCl → MgCl2 + H2'},
            10: {'equation': '__NaOH + __H2SO4 ➜ __Na2SO4 + __H2O', 'coefficients': [2, 1, 1, 2],
                'theory': '🧪 Реакция нейтрализации',
                'explanation': '2NaOH + H2SO4 → Na2SO4 + 2H2O'}
        }
        return equations.get(level, equations[1])
    
    # ============ HARD LEVELS (1-10) - Reaction Prediction ============
    def get_hard_challenge(self, level: int) -> Dict:
        """Генерация задач для Hard сложности (предсказание реакции)"""
        reactions = {
            1: {'reactants': ['Na', 'Cl2'], 'product': 'NaCl', 'type': 'synthesis',
                'explanation': '2Na + Cl2 → 2NaCl', 'theory': 'Натрий отдает электрон, хлор принимает'},
            2: {'reactants': ['H2', 'O2'], 'product': 'H2O', 'type': 'combustion',
                'explanation': '2H2 + O2 → 2H2O', 'theory': 'Водород горит с образованием воды'},
            3: {'reactants': ['C', 'O2'], 'product': 'CO2', 'type': 'combustion',
                'explanation': 'C + O2 → CO2', 'theory': 'Полное сгорание углерода'},
            4: {'reactants': ['Fe', 'O2'], 'product': 'Fe2O3', 'type': 'oxidation',
                'explanation': '4Fe + 3O2 → 2Fe2O3', 'theory': 'Железо ржавеет на воздухе'},
            5: {'reactants': ['Ca', 'H2O'], 'product': 'Ca(OH)2', 'type': 'reaction',
                'explanation': 'Ca + 2H2O → Ca(OH)2 + H2↑', 'theory': 'Щелочноземельный металл реагирует с водой'},
            6: {'reactants': ['Mg', 'HCl'], 'product': 'MgCl2', 'type': 'single displacement',
                'explanation': 'Mg + 2HCl → MgCl2 + H2↑', 'theory': 'Магний вытесняет водород из кислоты'},
            7: {'reactants': ['NaOH', 'H2SO4'], 'product': 'Na2SO4', 'type': 'neutralization',
                'explanation': '2NaOH + H2SO4 → Na2SO4 + 2H2O', 'theory': 'Кислота + основание → соль + вода'},
            8: {'reactants': ['Al', 'O2'], 'product': 'Al2O3', 'type': 'oxidation',
                'explanation': '4Al + 3O2 → 2Al2O3', 'theory': 'Алюминий пассивируется на воздухе'},
            9: {'reactants': ['CH4', 'O2', 'heat'], 'product': 'CO2', 'type': 'combustion',
                'explanation': 'CH4 + 2O2 → CO2 + 2H2O', 'theory': 'Полное сгорание метана'},
            10: {'reactants': ['S', 'O2', 'H2O'], 'product': 'H2SO4', 'type': 'chain',
                'explanation': 'S + O2 → SO2, 2SO2 + O2 → 2SO3, SO3 + H2O → H2SO4', 
                'theory': 'Промышленный способ получения серной кислоты'}
        }
        return reactions.get(level, reactions[1])
    
    def get_challenge(self, subject: str, difficulty: str, level: int) -> Dict:
        """Главный метод для получения задачи"""
        if subject != 'chemistry':
            return None
            
        if difficulty == 'easy':
            challenge = self.get_easy_challenge(level)
            return {
                'type': 'builder',
                'difficulty': 'easy',
                'level': level,
                'target_name': challenge['name'],
                'target_formula': challenge['formula'],
                'components': challenge['components'],
                'fact': challenge.get('fact', ''),
                'hint': challenge.get('hint', ''),
                'timeLimit': 30
            }
        elif difficulty == 'medium':
            challenge = self.get_medium_challenge(level)
            return {
                'type': 'balancer',
                'difficulty': 'medium',
                'level': level,
                'equation': challenge['equation'],
                'coefficients': challenge['coefficients'],
                'theory': challenge.get('theory', ''),
                'explanation': challenge.get('explanation', ''),
                'timeLimit': 45
            }
        else:  # hard
            challenge = self.get_hard_challenge(level)
            # Генерируем неправильные варианты для выбора
            wrong_options = self.generate_wrong_options(challenge['product'])
            return {
                'type': 'predictor',
                'difficulty': 'hard',
                'level': level,
                'reactants': challenge['reactants'],
                'correct_product': challenge['product'],
                'options': [challenge['product']] + wrong_options,
                'explanation': challenge.get('explanation', ''),
                'theory': challenge.get('theory', ''),
                'timeLimit': 60
            }
    
    def generate_wrong_options(self, correct: str, count: int = 3) -> List[str]:
        """Генерация неправильных вариантов ответа"""
        wrong = []
        similar = {
            'NaCl': ['NaCl2', 'Na2Cl', 'NaO', 'KCl'],
            'H2O': ['H2O2', 'HO', 'H2O3', 'H3O'],
            'CO2': ['CO', 'C2O', 'CO3', 'C2O2'],
            'Fe2O3': ['FeO', 'Fe3O4', 'Fe2O', 'FeO3'],
            'Ca(OH)2': ['CaOH', 'Ca(OH)3', 'CaO', 'CaH2'],
            'MgCl2': ['MgCl', 'Mg2Cl', 'MgCl3', 'MgO'],
            'Na2SO4': ['NaSO4', 'Na2SO3', 'Na2S', 'Na2SO5'],
            'Al2O3': ['AlO', 'Al2O', 'Al3O2', 'AlO2'],
            'H2SO4': ['HSO4', 'H2SO3', 'H2S', 'H2SO5']
        }
        
        if correct in similar:
            wrong = similar[correct][:count]
        else:
            wrong = [correct + '2', correct[:-1] if len(correct) > 1 else correct + 'X', 'X' + correct]
        
        random.shuffle(wrong)
        return wrong[:count]

# Flask endpoint для интеграции
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
generator = ChemistryGenerator()

@app.route('/api/chemistry/challenge/<difficulty>/<int:level>', methods=['GET'])
def get_challenge(difficulty, level):
    """API endpoint для получения химической задачи"""
    challenge = generator.get_challenge('chemistry', difficulty, level)
    if challenge:
        return jsonify(challenge)
    return jsonify({'error': 'Challenge not found'}), 404

@app.route('/api/chemistry/check', methods=['POST'])
def check_answer():
    """Проверка ответа пользователя"""
    data = request.json
    difficulty = data.get('difficulty')
    level = data.get('level')
    answer = data.get('answer')
    answer_type = data.get('type', 'builder')
    
    challenge = generator.get_challenge('chemistry', difficulty, level)
    
    if answer_type == 'builder':
        is_correct = answer.get('formula') == challenge.get('target_formula')
    elif answer_type == 'balancer':
        is_correct = answer.get('coefficients') == challenge.get('coefficients')
    else:  # predictor
        is_correct = answer.get('product') == challenge.get('correct_product')
    
    return jsonify({
        'correct': is_correct,
        'explanation': challenge.get('explanation', ''),
        'theory': challenge.get('theory', ''),
        'correct_answer': challenge.get('target_formula') or challenge.get('correct_product')
    })

if __name__ == '__main__':
    app.run(port=3001, debug=True)