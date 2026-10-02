from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.v1.router import api_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API para modelado predictivo de indicadores UI GreenMetric"
)

# CORS para que el frontend pueda conectarse
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, limita esto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar todos los endpoints bajo /api/v1
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "mensaje": f"Bienvenido a {settings.app_name} API v{settings.app_version}",
        "documentacion": "/docs"
    }