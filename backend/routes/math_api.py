from fastapi import APIRouter, Query
import sys
import os

# Добавляем путь к папке backend для импорта
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from generators.math_generator import generate_math_level

router = APIRouter(prefix="/api/math", tags=["math"])

@router.get("/level/{level_id}")
async def get_math_level(
    level_id: int,
    difficulty: str = Query("medium", enum=["easy", "medium", "hard"]),
    lang: str = Query("en", enum=["ru", "en"])
):
    """Генерация математической задачи по уровню и сложности"""
    if 1 <= level_id <= 10:
        return generate_math_level(level_id, difficulty, lang)
    return {"error": "level not found", "available": "1-10"}

@router.get("/health")
async def health():
    return {"status": "ok", "service": "math-generator"}