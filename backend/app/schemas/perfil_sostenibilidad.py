from pydantic import BaseModel, Field


class PerfilSostenibilidadBase(BaseModel):
    energia_clima: float = Field(1000.0, ge=0, le=2000)
    residuos: float = Field(850.0, ge=0, le=1700)
    agua: float = Field(550.0, ge=0, le=1100)
    transporte: float = Field(850.0, ge=0, le=1700)
    educacion_investigacion: float = Field(650.0, ge=0, le=1300)


class PerfilSostenibilidadUpdate(BaseModel):
    energia_clima: float | None = Field(None, ge=0, le=2000)
    residuos: float | None = Field(None, ge=0, le=1700)
    agua: float | None = Field(None, ge=0, le=1100)
    transporte: float | None = Field(None, ge=0, le=1700)
    educacion_investigacion: float | None = Field(None, ge=0, le=1300)


class PerfilSostenibilidadResponse(PerfilSostenibilidadBase):
    id: int

    class Config:
        from_attributes = True