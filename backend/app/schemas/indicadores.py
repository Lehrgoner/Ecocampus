from pydantic import BaseModel, Field

class IndicadorSI(BaseModel):
    """Un indicador individual SI"""
    codigo: str
    nombre: str
    puntaje: float
    puntaje_maximo: float
    porcentaje: float

class IndicadoresResponse(BaseModel):
    """Respuesta con todos los indicadores SI 1-8"""
    indicadores: list[IndicadorSI]
    puntaje_total_si: float
    puntaje_maximo_si: float = 1100.0
    porcentaje_total: float