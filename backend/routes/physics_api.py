from fastapi import APIRouter
from generators.physics_generator import generate_physics_level

router = APIRouter(prefix="/api/physics", tags=["physics"])

@router.get("/level/{level_id}")
async def get_physics_level(level_id: int):
    """Генерация физической задачи для указанного уровня (1-10)"""
    if 1 <= level_id <= 10:
        return generate_physics_level(level_id)
    return {"error": "level not found", "available": "1-10"}

@router.get("/health")
async def health():
    return {"status": "ok", "service": "physics-generator"}