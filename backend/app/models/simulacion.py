from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class Simulacion(Base):
    __tablename__ = "simulaciones"

    id = Column(Integer, primary_key=True, index=True)
    campus_id = Column(Integer, ForeignKey("campus.id"), nullable=False, index=True)
    tipo_intervencion = Column(String(50), nullable=False)
    area_m2 = Column(Float, nullable=False)
    geom_geojson = Column(Text)
    puntajes_antes = Column(Text)
    puntajes_despues = Column(Text)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())