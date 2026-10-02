from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, usuarios, campus, zonas_verdes,
    indicadores, checklist, simulaciones,
    ranking, recomendaciones, perfil, reportes,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(usuarios.router)
api_router.include_router(campus.router)
api_router.include_router(zonas_verdes.router)
api_router.include_router(indicadores.router)
api_router.include_router(checklist.router)
api_router.include_router(simulaciones.router)
api_router.include_router(ranking.router)
api_router.include_router(recomendaciones.router)
api_router.include_router(perfil.router)
api_router.include_router(reportes.router)