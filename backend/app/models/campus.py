from sqlalchemy import Column, Integer, Float, String, ForeignKey
from app.core.database import Base


class Campus(Base):
    __tablename__ = "campus"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    area_total_m2 = Column(Float, nullable=False)
    poblacion_total = Column(Integer, nullable=False)
    ciudad = Column(String(100))
    pais = Column(String(100))