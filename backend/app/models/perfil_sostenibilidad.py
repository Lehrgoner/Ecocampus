from sqlalchemy import Column, Integer, Float, ForeignKey
from app.core.database import Base


class PerfilSostenibilidad(Base):
    __tablename__ = "perfil_sostenibilidad"

    id = Column(Integer, primary_key=True, index=True)
    campus_id = Column(
        Integer, 
        ForeignKey("campus.id"), 
        nullable=False, 
        index=True, 
        unique=True,  # Un perfil por campus
    )

    energia_clima = Column(Float, default=1000.0)
    residuos = Column(Float, default=850.0)
    agua = Column(Float, default=550.0)
    transporte = Column(Float, default=850.0)
    educacion_investigacion = Column(Float, default=650.0)