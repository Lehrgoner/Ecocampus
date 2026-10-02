from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Usuario(Base):
    """
    Usuarios del sistema con diferentes roles.
    
    Roles:
    - admin: Gestiona usuarios, ve todos los campus
    - gestor: Administra sus campus y sus zonas verdes
    - consultor: Solo lectura de sus campus
    - pendiente: Registrado pero no aprobado aún
    """
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    cedula = Column(String(15), unique=True, nullable=False, index=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False, default="pendiente")
    activo = Column(Boolean, default=False, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    aprobado_por = Column(Integer, nullable=True)
    aprobado_en = Column(DateTime(timezone=True), nullable=True)