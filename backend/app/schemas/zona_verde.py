from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class ZonaVerdeBase(BaseModel):
    """Datos básicos de una zona verde"""
    nombre: str = Field(..., min_length=1, max_length=255)
    tipo: str = Field(..., description="bosque_academico, vegetacion_plantada, cesped, jardin, jardin_lluvia")
    area_m2: Optional[float] = Field(None, ge=0)
    uso_academico: bool = Field(
        False,
        description="Solo para bosques: si se usa con fines académicos/de investigación (requisito SI 2)"
    )


class ZonaVerdeCreate(ZonaVerdeBase):
    """Schema para crear una nueva zona verde"""
    geom: Dict[str, Any] = Field(..., description="Geometría en formato GeoJSON (Polygon)")


class ZonaVerdeUpdate(BaseModel):
    """Schema para actualizar una zona verde"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    tipo: Optional[str] = None
    area_m2: Optional[float] = Field(None, ge=0)
    uso_academico: Optional[bool] = None
    geom: Optional[Dict[str, Any]] = Field(None, description="Geometría en formato GeoJSON (Polygon)")


class ZonaVerdeResponse(ZonaVerdeBase):
    """Schema para la respuesta de zona verde"""
    id: int
    geom: Dict[str, Any]

    class Config:
        from_attributes = True


class ZonaVerdeListResponse(BaseModel):
    """Schema para listar zonas verdes como FeatureCollection"""
    type: str = "FeatureCollection"
    features: list[Dict[str, Any]]