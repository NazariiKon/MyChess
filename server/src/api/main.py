from fastapi import APIRouter

from src.api.routes import logic

api_router = APIRouter()
api_router.include_router(logic.router)