import random
import math

def get_fallback_physics_task():
    """Безопасный fallback для физики"""
    return {
        "q": "Снаряд выпущен под углом 45° со скоростью 20 м/с. Найти дальность полёта (g = 9.8 м/с²).",
        "a": 40.8,
        "solutionSteps": [
            "1️⃣ Формула: R = (v² × sin(2α)) / g",
            "2️⃣ sin(90°) = 1",
            "3️⃣ R = (400 × 1) / 9.8 ≈ 40.8 м"
        ],
        "theory": {
            "rule": "Максимальная дальность при угле 45°",
            "formula": "R = (v² × sin(2α)) / g"
        },
        "example": {
            "text": "Снаряд под углом 30°, скорость 30 м/с",
            "answer": "79.5 м",
            "steps": ["R = (900 × 0.866) / 9.8 ≈ 79.5 м"]
        },
        "hintSteps": ["Используй формулу R = (v² × sin(2α)) / g", "sin(2α) = ?", "Подставь числа"]
    }

def generate_physics_projectile():
    """Задача про снаряд (дальность полёта)"""
    v = random.randint(10, 50)
    angle = random.randint(25, 65)
    g = 9.8
    rad = math.radians(2 * angle)
    distance = round((v**2 * math.sin(rad)) / g, 1)
    
    return {
        "q": f"Снаряд выпущен под углом {angle}° со скоростью {v} м/с. Найти дальность полёта (g = 9.8 м/с²).",
        "a": distance,
        "type": "projectile",
        "solutionSteps": [
            f"1️⃣ sin(2×{angle}°) = sin({2*angle}°) = {round(math.sin(rad), 3)}",
            f"2️⃣ R = ({v}² × {round(math.sin(rad), 3)}) / {g}",
            f"3️⃣ R = {distance} м"
        ],
        "theory": {
            "rule": "Дальность полёта: R = (v² × sin(2α)) / g",
            "formula": "R = (v² × sin(2α)) / g",
            "max_at": "Максимальная дальность при угле 45°"
        },
        "example": {
            "text": "v = 20 м/с, α = 45°",
            "answer": "40.8 м",
            "steps": ["sin(90°) = 1", "R = 400 / 9.8 ≈ 40.8 м"]
        },
        "hintSteps": ["Запиши формулу дальности", "Вычисли sin(2α)", "Подставь значения"]
    }

def generate_physics_freefall():
    """Задача про свободное падение"""
    h = random.randint(20, 100)
    g = 9.8
    t = round(math.sqrt(2 * h / g), 1)
    
    return {
        "q": f"Тело падает с высоты {h} м. Найти время падения (g = 9.8 м/с²).",
        "a": t,
        "type": "freefall",
        "solutionSteps": [
            f"1️⃣ Формула: t = √(2h/g)",
            f"2️⃣ t = √(2 × {h} / {g}) = √{round(2*h/g, 1)}",
            f"3️⃣ t = {t} с"
        ],
        "theory": {
            "rule": "Свободное падение: h = gt²/2 → t = √(2h/g)",
            "formula": "t = √(2h/g)"
        },
        "example": {
            "text": "h = 45 м",
            "answer": "3.0 с",
            "steps": ["t = √(2×45/9.8) = √9.18 ≈ 3.0 с"]
        },
        "hintSteps": ["Используй формулу t = √(2h/g)", "Подставь высоту", "Вычисли корень"]
    }

def generate_physics_newton():
    """Задача про второй закон Ньютона"""
    m = random.randint(2, 10)
    a = random.randint(2, 8)
    f = round(m * a, 1)
    
    return {
        "q": f"Тело массой {m} кг движется с ускорением {a} м/с². Найти силу, действующую на тело.",
        "a": f,
        "type": "newton",
        "solutionSteps": [
            f"1️⃣ Формула: F = m × a",
            f"2️⃣ F = {m} × {a}",
            f"3️⃣ F = {f} Н"
        ],
        "theory": {
            "rule": "Второй закон Ньютона: сила = масса × ускорение",
            "formula": "F = m × a",
            "unit": "Ньютон (Н)"
        },
        "example": {
            "text": "m = 5 кг, a = 2 м/с²",
            "answer": "10 Н",
            "steps": ["F = 5 × 2 = 10 Н"]
        },
        "hintSteps": ["Вспомни формулу F = m × a", "Подставь значения", "Вычисли результат"]
    }

def generate_physics_kinetic():
    """Задача про кинетическую энергию"""
    m = random.randint(2, 15)
    v = random.randint(3, 12)
    ke = round(0.5 * m * v**2, 1)
    
    return {
        "q": f"Тело массой {m} кг движется со скоростью {v} м/с. Найти кинетическую энергию.",
        "a": ke,
        "type": "kinetic",
        "solutionSteps": [
            f"1️⃣ Формула: Eк = (m × v²) / 2",
            f"2️⃣ Eк = ({m} × {v}²) / 2 = ({m} × {v**2}) / 2",
            f"3️⃣ Eк = {ke} Дж"
        ],
        "theory": {
            "rule": "Кинетическая энергия: Eк = mv²/2",
            "formula": "Eк = (m × v²) / 2",
            "unit": "Джоуль (Дж)"
        },
        "example": {
            "text": "m = 10 кг, v = 5 м/с",
            "answer": "125 Дж",
            "steps": ["Eк = (10 × 25) / 2 = 125 Дж"]
        },
        "hintSteps": ["Формула Eк = mv²/2", "Сначала вычисли квадрат скорости", "Раздели на 2"]
    }

PHYSICS_GENERATORS = {
    1: generate_physics_projectile,
    2: generate_physics_freefall,
    3: generate_physics_newton,
    4: generate_physics_kinetic,
    5: generate_physics_projectile,
    6: generate_physics_freefall,
    7: generate_physics_newton,
    8: generate_physics_kinetic,
    9: generate_physics_projectile,
    10: generate_physics_freefall,
}

def generate_physics_level(level_id: int):
    generator = PHYSICS_GENERATORS.get(level_id)
    if generator:
        return generator()
    return get_fallback_physics_task()