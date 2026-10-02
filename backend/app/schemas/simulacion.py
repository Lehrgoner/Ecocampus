from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class SimulacionRequest(BaseModel):
    """Schema para solicitar una simulación"""
    tipo_intervencion: str = Field(..., description="Tipo: bosque_academico, vegetacion_plantada, jardin_lluvia, cesped")
    geom: Dict[str, Any] = Field(..., description="Geometría en formato GeoJSON (Polygon)")
    uso_academico: bool = Field(
        True,
        description="Solo aplica a bosques: si se usará con fines académicos (requisito SI 2)"
    )

class SimulacionResponse(BaseModel):
    """Schema para la respuesta de una simulación"""
    id: int
    tipo_intervencion: str
    area_m2: float
    puntajes_antes: Dict[str, Any]
    puntajes_despues: Dict[str, Any]
    ranking_antes: Optional[int] = None
    ranking_despues: Optional[int] = None
    creado_en: datetime

    class Config:
        from_attributes = True