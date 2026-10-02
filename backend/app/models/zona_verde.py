from geoalchemy2 import Geometry
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from app.core.database import Base


class ZonaVerde(Base):
    __tablename__ = "zonas_verdes"

    id = Column(Integer, primary_key=True, index=True)
    campus_id = Column(Integer, ForeignKey("campus.id"), nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)
    area_m2 = Column(Float)
    # Solo aplica a tipo 'bosque_academico'. Indica si se usa con fines
    # de investigación, docencia y/o vinculación comunitaria (requisito SI 2).
    uso_academico = Column(Boolean, default=False, nullable=False)
    geom = Column(Geometry("POLYGON", srid=4326), nullable=False)