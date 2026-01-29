from fastapi import APIRouter

from .analytics import router as analytics_router
from .import_data import router as import_router
from .productivity import router as productivity_router
from .routines import router as routines_router
from .users import router as users_router


api_router = APIRouter(prefix="/api")

api_router.include_router(users_router)
api_router.include_router(routines_router)
api_router.include_router(productivity_router)
api_router.include_router(analytics_router)
api_router.include_router(import_router)

__all__ = ["api_router"]
