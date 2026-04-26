import random

# ==================== HELPER FUNCTIONS ====================
def is_valid_number(num):
    if abs(num) > 1000:
        return False
    if isinstance(num, float):
        if round(num, 2) != num:
            return False
    return True

def validate_and_fix(generator_func):
    def wrapper(difficulty="medium", lang="en", *args, **kwargs):
        max_attempts = 15
        for attempt in range(max_attempts):
            try:
                result = generator_func(difficulty, lang, *args, **kwargs)
                if result and 'a' in result:
                    answer = result['a']
                    if is_valid_number(answer) and 0.5 <= answer <= 100:
                        return result
            except Exception as e:
                print(f"Generation error: {e}, attempt {attempt + 1}")
                continue
        return get_fallback_math_task()
    return wrapper

def get_fallback_math_task():
    return {
        "q": "4x - (x + 2) = 10",
        "a": 4,
        "difficulty": "easy",
        "difficultyName": "Easy",
        "multiplier": 1.0,
        "solutionSteps": [
            "1️⃣ Open brackets: 4x - x - 2 = 10",
            "2️⃣ Simplify: 3x - 2 = 10",
            "3️⃣ Move -2: 3x = 12",
            "4️⃣ Divide by 3: x = 4"
        ],
        "theory": {
            "rule": "Minus before brackets changes signs of ALL terms inside",
            "visual": "-(x + 2) = -x - 2",
            "formula": "4x - (x + 2) = 4x - x - 2 = 3x - 2"
        },
        "hintSteps": [
            {"text": "Open brackets (minus changes signs)", "cost": 3},
            {"text": "4x - x - 2 = 10", "cost": 5},
            {"text": "3x = 12", "cost": 10},
            {"text": "x = 4", "cost": 15}
        ]
    }

# ==================== LEVEL 1: Brackets ====================
@validate_and_fix
def generate_math_level1(difficulty="medium", lang="en"):
    if difficulty == "easy":
        x = random.randint(2, 8)
        a = random.randint(2, 5)
        b = random.randint(1, a - 1) if a > 1 else 1
        c = random.randint(1, 8)
        d = a * x - (b * x + c)
        
        return {
            "q": f"{a}x - ({b}x + {c}) = {d}",
            "a": x,
            "difficulty": "easy",
            "difficultyName": "Easy",
            "multiplier": 1.0,
            "solutionSteps": [
                f"1️⃣ Look at the brackets: ({b}x + {c}) has a minus in front",
                f"2️⃣ Minus before brackets changes ALL signs inside: -({b}x + {c}) = -{b}x - {c}",
                f"3️⃣ Rewrite the equation: {a}x - {b}x - {c} = {d}",
                f"4️⃣ Combine like terms ({a}x - {b}x): {a-b}x - {c} = {d}",
                f"5️⃣ Move -{c} to the right side (changes to +): {a-b}x = {d} + {c}",
                f"6️⃣ Calculate right side: {a-b}x = {d + c}",
                f"7️⃣ Divide both sides by {a-b}: x = {x}"
            ],
            "theory": {
                "rule": f"RULE: Minus before brackets changes ALL signs inside",
                "visual": f"-({b}x + {c}) = -{b}x - {c}",
                "formula": f"{a}x - ({b}x + {c}) = {a}x - {b}x - {c} = {a-b}x - {c} = {d} → x = {x}",
                "example": "Example: 5x - (2x + 3) = 5x - 2x - 3 = 3x - 3"
            },
            "hintSteps": [
                {"text": f"What happens to the bracket? -({b}x + {c}) = ?", "cost": 3},
                {"text": f"-({b}x + {c}) = -{b}x - {c}", "cost": 5},
                {"text": f"{a}x - {b}x - {c} = {d}", "cost": 7},
                {"text": f"{a-b}x - {c} = {d}", "cost": 10},
                {"text": f"{a-b}x = {d + c} = {d + c}", "cost": 12},
                {"text": f"Divide by {a-b}: x = {x}", "cost": 15}
            ]
        }
    elif difficulty == "medium":
        x = random.randint(3, 10)
        a = random.randint(3, 6)
        b = random.randint(2, a)
        c = random.randint(2, 10)
        d = random.randint(1, 5)
        e = a * x - b * (x - c) - d * x
        
        return {
            "q": f"{a}x - {b}(x - {c}) = {d}x + {e}",
            "a": x,
            "difficulty": "medium",
            "difficultyName": "Medium",
            "multiplier": 1.5,
            "solutionSteps": [
                f"1️⃣ First, open the bracket: {b}(x - {c}) = {b}x - {b*c}",
                f"2️⃣ But there's a minus before it: -{b}(x - {c}) = -{b}x + {b*c}",
                f"3️⃣ Rewrite the equation: {a}x - {b}x + {b*c} = {d}x + {e}",
                f"4️⃣ Combine x terms on left: {a-b}x + {b*c} = {d}x + {e}",
                f"5️⃣ Move {d}x to left: {a-b}x - {d}x + {b*c} = {e}",
                f"6️⃣ Combine x terms: {a-b-d}x + {b*c} = {e}",
                f"7️⃣ Move +{b*c} to right: {a-b-d}x = {e} - {b*c}",
                f"8️⃣ Simplify: {a-b-d}x = {e - b*c}",
                f"9️⃣ Divide by {a-b-d}: x = {x}"
            ],
            "theory": {
                "rule": f"Distributive property: {b}(x - {c}) = {b}x - {b*c}",
                "visual": f"-{b}(x - {c}) = -{b}x + {b*c}",
                "formula": f"{a}x - {b}(x - {c}) = {a}x - {b}x + {b*c} = {a-b}x + {b*c}",
                "example": "Example: 5x - 2(x - 3) = 5x - 2x + 6 = 3x + 6"
            },
            "hintSteps": [
                {"text": f"Open the bracket: {b}(x - {c}) = {b}x - {b*c}", "cost": 3},
                {"text": f"Apply minus: -{b}(x - {c}) = -{b}x + {b*c}", "cost": 5},
                {"text": f"{a}x - {b}x + {b*c} = {d}x + {e}", "cost": 7},
                {"text": f"{a-b}x + {b*c} = {d}x + {e}", "cost": 10},
                {"text": f"Move x terms: {a-b-d}x = {e - b*c}", "cost": 12},
                {"text": f"x = {x}", "cost": 15}
            ]
        }
    else:  # hard
        x = random.randint(4, 12)
        a = random.randint(2, 5)
        b = random.randint(2, 4)
        c = random.randint(1, 6)
        d = random.randint(2, 5)
        e = random.randint(1, 8)
        f = a * (x - b) + c - d * (x + e)
        
        return {
            "q": f"{a}(x - {b}) + {c} = {d}(x + {e}) + {f}",
            "a": x,
            "difficulty": "hard",
            "difficultyName": "Hard",
            "multiplier": 2.5,
            "solutionSteps": [
                f"1️⃣ First, open the left bracket: {a}(x - {b}) = {a}x - {a*b}",
                f"2️⃣ Then open the right bracket: {d}(x + {e}) = {d}x + {d*e}",
                f"3️⃣ Rewrite the equation: {a}x - {a*b} + {c} = {d}x + {d*e} + {f}",
                f"4️⃣ Combine constants on left: -{a*b} + {c} = -{a*b - c}",
                f"5️⃣ Combine constants on right: {d*e} + {f} = {d*e + f}",
                f"6️⃣ Equation becomes: {a}x - {a*b - c} = {d}x + {d*e + f}",
                f"7️⃣ Move {d}x to left: {a}x - {d}x - {a*b - c} = {d*e + f}",
                f"8️⃣ Combine x terms: {a-d}x - {a*b - c} = {d*e + f}",
                f"9️⃣ Move constant to right: {a-d}x = {d*e + f} + {a*b - c}",
                f"🔟 Calculate: {a-d}x = {d*e + f + a*b - c}",
                f"1️⃣1️⃣ Divide by {a-d}: x = {x}"
            ],
            "theory": {
                "rule": "Open all brackets first, then combine like terms",
                "visual": f"{a}(x - {b}) = {a}x - {a*b}, {d}(x + {e}) = {d}x + {d*e}",
                "formula": f"{a}(x - {b}) + {c} = {d}(x + {e}) + {f} → {a-d}x = {d*e + f + a*b - c} → x = {x}",
                "example": "Example: 3(x - 2) + 4 = 2(x + 1) + 10 → 3x - 6 + 4 = 2x + 2 + 10 → x = 14"
            },
            "hintSteps": [
                {"text": f"Open left bracket: {a}(x - {b}) = {a}x - {a*b}", "cost": 3},
                {"text": f"Open right bracket: {d}(x + {e}) = {d}x + {d*e}", "cost": 5},
                {"text": f"{a}x - {a*b} + {c} = {d}x + {d*e} + {f}", "cost": 7},
                {"text": f"Simplify constants: {a}x - {a*b - c} = {d}x + {d*e + f}", "cost": 10},
                {"text": f"Move x terms: {a-d}x = {d*e + f + a*b - c}", "cost": 12},
                {"text": f"x = {x}", "cost": 15}
            ]
        }

# ==================== LEVEL 2: Quadratic Equations ====================
@validate_and_fix
def generate_math_level2(difficulty="medium", lang="en"):
    if difficulty == "easy":
        x = random.randint(2, 8)
        a = random.randint(2, 5)
        b = a * (x ** 2)
        
        return {
            "q": f"{a}x² = {b}",
            "a": x,
            "difficulty": "easy",
            "difficultyName": "Easy",
            "multiplier": 1.0,
            "solutionSteps": [
                f"1️⃣ Equation: {a}x² = {b}",
                f"2️⃣ Divide both sides by {a}: x² = {b} ÷ {a}",
                f"3️⃣ Calculate: x² = {b // a}",
                f"4️⃣ Take square root: x = √{b // a}",
                f"5️⃣ Since {x} × {x} = {b // a}, we get: x = {x}"
            ],
            "theory": {
                "rule": f"To isolate x², divide both sides by the coefficient {a}",
                "visual": f"x² = {b // a} → x = √{b // a} = {x}",
                "formula": f"{a}x² = {b} → x² = {b // a} → x = {x}",
                "example": "Example: 3x² = 27 → x² = 9 → x = 3"
            },
            "hintSteps": [
                {"text": f"Divide both sides by {a}", "cost": 3},
                {"text": f"x² = {b // a}", "cost": 5},
                {"text": f"Take square root: x = √{b // a}", "cost": 10},
                {"text": f"x = {x}", "cost": 15}
            ]
        }
    elif difficulty == "medium":
        x = random.randint(3, 9)
        a = x ** 2
        
        return {
            "q": f"x² - {a} = 0",
            "a": x,
            "difficulty": "medium",
            "difficultyName": "Medium",
            "multiplier": 1.5,
            "solutionSteps": [
                f"1️⃣ Equation: x² - {a} = 0",
                f"2️⃣ Move {a} to the right side: x² = {a}",
                f"3️⃣ Take square root of both sides: x = √{a}",
                f"4️⃣ Since {x} × {x} = {a}, we get: x = {x}"
            ],
            "theory": {
                "rule": f"x² - a = 0 → x² = a → x = √a",
                "visual": f"x² = {a} → x = √{a} = {x}",
                "formula": f"x² - {a} = 0 → x² = {a} → x = {x}",
                "example": "Example: x² - 9 = 0 → x² = 9 → x = 3"
            },
            "hintSteps": [
                {"text": f"Move {a} to right: x² = {a}", "cost": 5},
                {"text": f"Take square root: x = √{a}", "cost": 10},
                {"text": f"x = {x}", "cost": 15}
            ]
        }
    else:  # hard
        x = random.randint(3, 8)
        a = x ** 2
        b = 2 * x
        
        return {
            "q": f"x² + {b}x + {a} = 0",
            "a": x,
            "difficulty": "hard",
            "difficultyName": "Hard",
            "multiplier": 2.5,
            "solutionSteps": [
                f"1️⃣ Equation: x² + {b}x + {a} = 0",
                f"2️⃣ Notice this is a perfect square: (x + {x})² = x² + {b}x + {a}",
                f"3️⃣ Rewrite as: (x + {x})² = 0",
                f"4️⃣ Take square root: x + {x} = 0",
                f"5️⃣ Solve: x = -{x}"
            ],
            "theory": {
                "rule": "Perfect square formula: (x + a)² = x² + 2ax + a²",
                "visual": f"(x + {x})² = x² + {b}x + {a}",
                "formula": f"x² + {b}x + {a} = 0 → (x + {x})² = 0 → x = -{x}",
                "example": "Example: x² + 6x + 9 = 0 → (x + 3)² = 0 → x = -3"
            },
            "hintSteps": [
                {"text": "Recognize this as a perfect square", "cost": 5},
                {"text": f"x² + {b}x + {a} = (x + {x})²", "cost": 10},
                {"text": f"(x + {x})² = 0 → x = -{x}", "cost": 15}
            ]
        }

# ==================== LEVEL 3: Fractions ====================
@validate_and_fix
def generate_math_level3(difficulty="medium", lang="en"):
    if difficulty == "easy":
        x = random.randint(2, 15)
        a = random.randint(2, 6)
        b = random.randint(1, 10)
        
        if x % a != 0:
            raise ValueError(f"x={x} not divisible by a={a}")
        
        c = x // a + b
        
        return {
            "q": f"x/{a} + {b} = {c}",
            "a": x,
            "difficulty": "easy",
            "difficultyName": "Easy",
            "multiplier": 1.0,
            "solutionSteps": [
                f"1️⃣ Equation: x/{a} + {b} = {c}",
                f"2️⃣ Subtract {b} from both sides: x/{a} = {c} - {b}",
                f"3️⃣ Calculate right side: x/{a} = {c - b}",
                f"4️⃣ Multiply both sides by {a}: x = {c - b} × {a}",
                f"5️⃣ Calculate: x = {x}"
            ],
            "theory": {
                "rule": f"First move constant {b}, then multiply by denominator {a}",
                "visual": f"x/{a} = {c-b} → x = {x}",
                "formula": f"x/{a} + {b} = {c} → x/{a} = {c-b} → x = {x}",
                "example": "Example: x/3 + 3 = 8 → x/3 = 5 → x = 15"
            },
            "hintSteps": [
                {"text": f"Subtract {b}: x/{a} = {c - b}", "cost": 5},
                {"text": f"Multiply by {a}: x = {c - b} × {a}", "cost": 10},
                {"text": f"x = {x}", "cost": 15}
            ]
        }
    elif difficulty == "medium":
        x = random.randint(4, 20)
        a = random.randint(2, 4)
        b = random.randint(2, 8)
        c = random.randint(2, 6)
        numerator = a * x - b
        
        if numerator % c != 0:
            raise ValueError("Numerator not divisible by denominator")
        
        d = numerator // c
        
        return {
            "q": f"({a}x - {b})/{c} = {d}",
            "a": x,
            "difficulty": "medium",
            "difficultyName": "Medium",
            "multiplier": 1.5,
            "solutionSteps": [
                f"1️⃣ Equation: ({a}x - {b})/{c} = {d}",
                f"2️⃣ Multiply both sides by {c}: {a}x - {b} = {d} × {c}",
                f"3️⃣ Calculate right side: {a}x - {b} = {d * c}",
                f"4️⃣ Move -{b} to the right (changes to +): {a}x = {d * c} + {b}",
                f"5️⃣ Calculate right side: {a}x = {d * c + b}",
                f"6️⃣ Divide both sides by {a}: x = {x}"
            ],
            "theory": {
                "rule": f"To eliminate denominator, multiply both sides by {c}",
                "visual": f"({a}x-{b})/{c} = {d} → {a}x-{b} = {d}×{c}",
                "formula": f"({a}x - {b})/{c} = {d} → {a}x - {b} = {d*c} → x = {x}",
                "example": "Example: (2x - 3)/4 = 5 → 2x - 3 = 20 → 2x = 23 → x = 11.5"
            },
            "hintSteps": [
                {"text": f"Multiply by {c}: {a}x - {b} = {d * c}", "cost": 5},
                {"text": f"Move {b}: {a}x = {d * c + b}", "cost": 10},
                {"text": f"Divide by {a}: x = {x}", "cost": 15}
            ]
        }
    else:  # hard
        x = random.randint(5, 24)
        a = random.randint(2, 5)
        b = random.randint(2, 8)
        c = random.randint(2, 6)
        d = random.randint(2, 5)
        f = random.randint(2, 4)
        e = (d * x * c - (a * x + b) * f) // c
        
        return {
            "q": f"({a}x + {b})/{c} = ({d}x - {e})/{f}",
            "a": x,
            "difficulty": "hard",
            "difficultyName": "Hard",
            "multiplier": 2.5,
            "solutionSteps": [
                f"1️⃣ Equation: ({a}x + {b})/{c} = ({d}x - {e})/{f}",
                f"2️⃣ Find common denominator: {c} × {f} = {c*f}",
                f"3️⃣ Multiply both sides by {c*f}: {f}({a}x + {b}) = {c}({d}x - {e})",
                f"4️⃣ Open brackets: {f*a}x + {f*b} = {c*d}x - {c*e}",
                f"5️⃣ Move x terms to left: {f*a}x - {c*d}x = -{c*e} - {f*b}",
                f"6️⃣ Combine x terms: {f*a - c*d}x = -{c*e + f*b}",
                f"7️⃣ Divide both sides: x = {x}"
            ],
            "theory": {
                "rule": "Multiply both sides by common denominator to eliminate fractions",
                "visual": f"({a}x+{b})/{c} = ({d}x-{e})/{f} → {f}({a}x+{b}) = {c}({d}x-{e})",
                "formula": f"({a}x+{b})/{c} = ({d}x-{e})/{f} → {f*a - c*d}x = -{c*e} - {f*b} → x = {x}",
                "example": "Example: (2x+1)/3 = (3x-2)/4 → 4(2x+1) = 3(3x-2) → x = 10"
            },
            "hintSteps": [
                {"text": f"Common denominator: {c} × {f} = {c*f}", "cost": 3},
                {"text": f"Multiply: {f}({a}x+{b}) = {c}({d}x-{e})", "cost": 5},
                {"text": f"Open brackets: {f*a}x + {f*b} = {c*d}x - {c*e}", "cost": 7},
                {"text": f"Move x terms: {f*a - c*d}x = -{c*e} - {f*b}", "cost": 10},
                {"text": f"x = {x}", "cost": 15}
            ]
        }

# ==================== LEVEL 4: (x + a)/b = c ====================
@validate_and_fix
def generate_math_level4(difficulty="medium", lang="en"):
    x = random.randint(3, 18)
    a = random.randint(1, 10)
    b = random.randint(2, 5)
    c = random.randint(2, 10)
    x = c * b - a
    
    return {
        "q": f"(x + {a})/{b} = {c}",
        "a": x,
        "difficulty": "medium",
        "difficultyName": "Medium",
        "multiplier": 1.5,
        "solutionSteps": [
            f"1️⃣ Equation: (x + {a})/{b} = {c}",
            f"2️⃣ Multiply both sides by {b}: (x + {a}) = {c} × {b}",
            f"3️⃣ Calculate right side: x + {a} = {c * b}",
            f"4️⃣ Subtract {a} from both sides: x = {c * b} - {a}",
            f"5️⃣ Calculate result: x = {x}"
        ],
        "theory": {
            "rule": f"To remove denominator, multiply both sides by {b}",
            "visual": f"(x + {a})/{b} = {c} → x + {a} = {c}×{b} = {c*b}",
            "formula": f"(x + {a})/{b} = {c} → x = {c}×{b} - {a} = {x}",
            "example": "Example: (x + 4)/2 = 9 → x + 4 = 18 → x = 14"
        },
        "hintSteps": [
            {"text": f"Multiply by {b}: x + {a} = {c * b}", "cost": 5},
            {"text": f"Subtract {a}: x = {c * b} - {a}", "cost": 10},
            {"text": f"x = {x}", "cost": 15}
        ]
    }

# ==================== LEVEL 5: a*x - (b*x - c) = d ====================
@validate_and_fix
def generate_math_level5(difficulty="medium", lang="en"):
    x = random.randint(3, 15)
    a = random.randint(2, 4)
    b = random.randint(1, a - 1) if a > 1 else 1
    c = random.randint(2, 12)
    d = a * x - (b * x - c)
    
    while d < 0:
        c = random.randint(2, 12)
        d = a * x - (b * x - c)
    
    return {
        "q": f"{a}x - ({b}x - {c}) = {d}",
        "a": x,
        "difficulty": "medium",
        "difficultyName": "Medium",
        "multiplier": 1.5,
        "solutionSteps": [
            f"1️⃣ Look at the brackets: ({b}x - {c}) has a minus in front",
            f"2️⃣ Minus before brackets changes ALL signs inside: -({b}x - {c}) = -{b}x + {c}",
            f"3️⃣ Rewrite the equation: {a}x - {b}x + {c} = {d}",
            f"4️⃣ Combine like terms ({a}x - {b}x): {a-b}x + {c} = {d}",
            f"5️⃣ Move +{c} to the right side (change sign): {a-b}x = {d} - {c}",
            f"6️⃣ Calculate right side: {a-b}x = {d - c}",
            f"7️⃣ Divide both sides by {a-b}: x = {x}"
        ],
        "theory": {
            "rule": f"RULE: Minus before brackets changes ALL signs inside",
            "visual": f"-({b}x - {c}) = -{b}x + {c}",
            "formula": f"{a}x - ({b}x - {c}) = {a}x - {b}x + {c} = {a-b}x + {c} = {d} → x = {x}",
            "example": "Example: 5x - (2x - 3) = 5x - 2x + 3 = 3x + 3"
        },
        "hintSteps": [
            {"text": f"What happens to the bracket? -({b}x - {c}) = ?", "cost": 3},
            {"text": f"-({b}x - {c}) = -{b}x + {c}", "cost": 5},
            {"text": f"{a}x - {b}x + {c} = {d}", "cost": 7},
            {"text": f"{a-b}x + {c} = {d}", "cost": 10},
            {"text": f"{a-b}x = {d - c} = {d - c}", "cost": 12},
            {"text": f"Divide by {a-b}: x = {x}", "cost": 15}
        ]
    }

# ==================== LEVEL 6: a*x - b = c*x + d ====================
@validate_and_fix
def generate_math_level6(difficulty="medium", lang="en"):
    x = random.randint(3, 12)
    a = x + random.randint(2, 5)
    b = random.randint(1, 10)
    c = random.randint(2, a - 1)
    d = a * x - b - c * x
    
    return {
        "q": f"{a}x - {b} = {c}x + {d}",
        "a": x,
        "difficulty": "medium",
        "difficultyName": "Medium",
        "multiplier": 1.5,
        "solutionSteps": [
            f"1️⃣ Equation: {a}x - {b} = {c}x + {d}",
            f"2️⃣ Move {c}x to the left side (changes sign): {a}x - {c}x - {b} = {d}",
            f"3️⃣ Combine x terms: {a-c}x - {b} = {d}",
            f"4️⃣ Move -{b} to the right side (changes to +): {a-c}x = {d} + {b}",
            f"5️⃣ Calculate right side: {a-c}x = {d + b}",
            f"6️⃣ Divide both sides by {a-c}: x = {x}"
        ],
        "theory": {
            "rule": "Move all x terms to left, numbers to right",
            "visual": f"{a}x - {b} = {c}x + {d} → {a-c}x = {d+b}",
            "formula": f"{a}x - {b} = {c}x + {d} → {a-c}x = {d+b} → x = {x}",
            "example": "Example: 5x - 8 = 2x + 10 → 3x = 18 → x = 6"
        },
        "hintSteps": [
            {"text": f"Move {c}x to left: {a-c}x - {b} = {d}", "cost": 5},
            {"text": f"Move {b} to right: {a-c}x = {d + b}", "cost": 10},
            {"text": f"x = {x}", "cost": 15}
        ]
    }

# ==================== LEVEL 7: x² - a = 0 ====================
@validate_and_fix
def generate_math_level7(difficulty="medium", lang="en"):
    x = random.randint(2, 10)
    a = x ** 2
    
    return {
        "q": f"x² - {a} = 0",
        "a": x,
        "difficulty": "medium",
        "difficultyName": "Medium",
        "multiplier": 1.5,
        "solutionSteps": [
            f"1️⃣ Equation: x² - {a} = 0",
            f"2️⃣ Move {a} to the right side: x² = {a}",
            f"3️⃣ Take square root of both sides: x = √{a}",
            f"4️⃣ Since {x} × {x} = {a}, we get: x = {x}"
        ],
        "theory": {
            "rule": f"x² - a = 0 → x² = a → x = √a",
            "visual": f"x² = {a} → x = √{a} = {x}",
            "formula": f"x² - {a} = 0 → x² = {a} → x = {x}",
            "example": "Example: x² - 9 = 0 → x² = 9 → x = 3"
        },
        "hintSteps": [
            {"text": f"Move {a} to right: x² = {a}", "cost": 5},
            {"text": f"Take square root: x = √{a}", "cost": 10},
            {"text": f"x = {x}", "cost": 15}
        ]
    }

# ==================== LEVEL 8: (a*x - b)/c = d ====================
@validate_and_fix
def generate_math_level8(difficulty="medium", lang="en"):
    x = random.randint(4, 15)
    a = random.randint(2, 5)
    b = random.randint(1, 12)
    c = random.randint(2, 6)
    numerator = a * x - b
    
    if numerator % c != 0:
        raise ValueError("Numerator not divisible by denominator")
    
    d = numerator // c
    
    return {
        "q": f"({a}x - {b})/{c} = {d}",
        "a": x,
        "difficulty": "medium",
        "difficultyName": "Medium",
        "multiplier": 1.5,
        "solutionSteps": [
            f"1️⃣ Equation: ({a}x - {b})/{c} = {d}",
            f"2️⃣ Multiply both sides by {c}: {a}x - {b} = {d} × {c}",
            f"3️⃣ Calculate right side: {a}x - {b} = {d * c}",
            f"4️⃣ Move -{b} to the right (changes to +): {a}x = {d * c} + {b}",
            f"5️⃣ Calculate right side: {a}x = {d * c + b}",
            f"6️⃣ Divide both sides by {a}: x = {x}"
        ],
        "theory": {
            "rule": f"To eliminate denominator, multiply both sides by {c}",
            "visual": f"({a}x-{b})/{c} = {d} → {a}x-{b} = {d}×{c}",
            "formula": f"({a}x - {b})/{c} = {d} → {a}x - {b} = {d*c} → x = {x}",
            "example": "Example: (2x - 3)/4 = 5 → 2x - 3 = 20 → 2x = 23 → x = 11.5"
        },
        "hintSteps": [
            {"text": f"Multiply by {c}: {a}x - {b} = {d * c}", "cost": 5},
            {"text": f"Move {b}: {a}x = {d * c + b}", "cost": 10},
            {"text": f"Divide by {a}: x = {x}", "cost": 15}
        ]
    }

# ==================== LEVEL 9: a*x + b = c*x - d ====================
@validate_and_fix
def generate_math_level9(difficulty="medium", lang="en"):
    x = random.randint(3, 12)
    a = x + 1
    b = random.randint(1, 10)
    c = a + random.randint(1, 3)
    d = c * x - a * x - b
    
    return {
        "q": f"{a}x + {b} = {c}x - {d}",
        "a": x,
        "difficulty": "medium",
        "difficultyName": "Medium",
        "multiplier": 1.5,
        "solutionSteps": [
            f"1️⃣ Equation: {a}x + {b} = {c}x - {d}",
            f"2️⃣ Move {c}x to the left side: {a}x - {c}x + {b} = -{d}",
            f"3️⃣ Combine x terms: {a-c}x + {b} = -{d}",
            f"4️⃣ Move +{b} to the right: {a-c}x = -{d} - {b}",
            f"5️⃣ Calculate right side: {a-c}x = -{d + b}",
            f"6️⃣ Multiply both sides by -1: {c-a}x = {d + b}",
            f"7️⃣ Divide by {c-a}: x = {x}"
        ],
        "theory": {
            "rule": "Move all x terms to left, numbers to right",
            "visual": f"{a}x + {b} = {c}x - {d} → {a-c}x = -{d} - {b}",
            "formula": f"{a}x + {b} = {c}x - {d} → {a-c}x = -{d+b} → x = {x}",
            "example": "Example: 2x + 3 = 4x - 5 → -2x = -8 → x = 4"
        },
        "hintSteps": [
            {"text": f"Move {c}x to left: {a-c}x + {b} = -{d}", "cost": 5},
            {"text": f"Move {b} to right: {a-c}x = -{d} - {b}", "cost": 10},
            {"text": f"x = {x}", "cost": 15}
        ]
    }

# ==================== LEVEL 10: Complex equation with brackets ====================
@validate_and_fix
def generate_math_level10(difficulty="medium", lang="en"):
    x = random.randint(4, 15)
    a = random.randint(2, 4)
    b = random.randint(1, 5)
    c = random.randint(2, 4)
    d = random.randint(1, 6)
    e = random.randint(2, 8)
    f = a * (x - b) + c - d * (x + e)
    
    return {
        "q": f"{a}(x - {b}) + {c} = {d}(x + {e}) + {f}",
        "a": x,
        "difficulty": "hard",
        "difficultyName": "Hard",
        "multiplier": 2.5,
        "solutionSteps": [
            f"1️⃣ First, open the left bracket: {a}(x - {b}) = {a}x - {a*b}",
            f"2️⃣ Then open the right bracket: {d}(x + {e}) = {d}x + {d*e}",
            f"3️⃣ Rewrite the equation: {a}x - {a*b} + {c} = {d}x + {d*e} + {f}",
            f"4️⃣ Combine constants on left: -{a*b} + {c} = -{a*b - c}",
            f"5️⃣ Combine constants on right: {d*e} + {f} = {d*e + f}",
            f"6️⃣ Equation becomes: {a}x - {a*b - c} = {d}x + {d*e + f}",
            f"7️⃣ Move {d}x to left: {a}x - {d}x - {a*b - c} = {d*e + f}",
            f"8️⃣ Combine x terms: {a-d}x - {a*b - c} = {d*e + f}",
            f"9️⃣ Move constant to right: {a-d}x = {d*e + f} + {a*b - c}",
            f"🔟 Calculate: {a-d}x = {d*e + f + a*b - c}",
            f"1️⃣1️⃣ Divide by {a-d}: x = {x}"
        ],
        "theory": {
            "rule": "Open all brackets first, then combine like terms",
            "visual": f"{a}(x - {b}) = {a}x - {a*b}, {d}(x + {e}) = {d}x + {d*e}",
            "formula": f"{a}(x - {b}) + {c} = {d}(x + {e}) + {f} → {a-d}x = {d*e + f + a*b - c} → x = {x}",
            "example": "Example: 3(x - 2) + 4 = 2(x + 1) + 10 → 3x - 6 + 4 = 2x + 2 + 10 → x = 14"
        },
        "hintSteps": [
            {"text": f"Open left bracket: {a}(x - {b}) = {a}x - {a*b}", "cost": 3},
            {"text": f"Open right bracket: {d}(x + {e}) = {d}x + {d*e}", "cost": 5},
            {"text": f"{a}x - {a*b} + {c} = {d}x + {d*e} + {f}", "cost": 7},
            {"text": f"Simplify: {a}x - {a*b - c} = {d}x + {d*e + f}", "cost": 10},
            {"text": f"Move x terms: {a-d}x = {d*e + f + a*b - c}", "cost": 12},
            {"text": f"x = {x}", "cost": 15}
        ]
    }

# ==================== GENERATORS DICTIONARY ====================
MATH_GENERATORS = {
    1: generate_math_level1,
    2: generate_math_level2,
    3: generate_math_level3,
    4: generate_math_level4,
    5: generate_math_level5,
    6: generate_math_level6,
    7: generate_math_level7,
    8: generate_math_level8,
    9: generate_math_level9,
    10: generate_math_level10,
}

def generate_math_level(level_id: int, difficulty: str = "medium", lang: str = "en"):
    generator = MATH_GENERATORS.get(level_id)
    if generator:
        return generator(difficulty, lang)
    return get_fallback_math_task()