from pydantic import BaseModel, Field
from typing import Optional

class CampusBase(BaseModel):
    """Datos básicos del campus"""
    nombre: str = Field(..., min_length=1, max_length=255, description="Nombre de la universidad")
    area_total_m2: float = Field(..., gt=0, description="Área total del campus en metros cuadrados")
    poblacion_total: int = Field(..., gt=0, description="Población total (estudiantes + personal)")
    ciudad: Optional[str] = Field(None, max_length=100, description="Ciudad donde se ubica el campus")
    pais: Optional[str] = Field(None, max_length=100, description="País donde se ubica el campus")

class CampusCreate(CampusBase):
    """Schema para crear un nuevo registro de campus"""
    pass

class CampusUpdate(BaseModel):
    """Schema para actualizar datos del campus (todos opcionales)"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    area_total_m2: Optional[float] = Field(None, gt=0)
    poblacion_total: Optional[int] = Field(None, gt=0)
    ciudad: Optional[str] = Field(None, max_length=100)
    pais: Optional[str] = Field(None, max_length=100)

class CampusResponse(CampusBase):
    """Schema para la respuesta del campus"""
    id: int

    class Config:
        from_attributes = True  # Para que funcione con SQLAlchemy