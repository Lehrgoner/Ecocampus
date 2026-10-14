"""
Dependencias de FastAPI para autenticación y autorización.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decodificar_token
from app.models.usuario import Usuario

# Esquema de seguridad para Swagger
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Usuario:
    """
    Obtiene el usuario autenticado a partir del token JWT.
    """
    credenciales_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o expiradas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = decodificar_token(token)
    
    if payload is None:
        raise credenciales_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credenciales_exception
    
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if usuario is None:
        raise credenciales_exception
    
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta no ha sido aprobada por un administrador",
        )
    
    return usuario


def get_current_admin(
    usuario: Usuario = Depends(get_current_user),
) -> Usuario:
    """Verifica que el usuario sea Admin."""
    if usuario.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden realizar esta acción",
        )
    return usuario


def get_current_gestor(
    usuario: Usuario = Depends(get_current_user),
) -> Usuario:
    """Verifica que el usuario sea Admin o Gestor."""
    if usuario.rol not in ("admin", "gestor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de Gestor o Admin",
        )
    return usuario


def get_current_consultor(
    usuario: Usuario = Depends(get_current_user),
) -> Usuario:
    """Cualquier usuario autenticado (Admin, Gestor o Consultor)."""
    return usuario

def get_current_campus(
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Obtiene el campus del usuario autenticado.
    
    - Admin: no se usa esta dependencia (usa campus_id directamente)
    - Gestor: primer campus que le pertenece
    - Consultor: campus asignado por el Admin
    """
    from app.models.campus import Campus

    # Si es consultor, devolver el campus asignado
    if usuario.rol == "consultor":
        if not usuario.campus_asignado_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tienes un campus asignado. Contacta al administrador.",
            )
        campus = db.query(Campus).filter(Campus.id == usuario.campus_asignado_id).first()
        if not campus:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El campus asignado no existe.",
            )
        return campus

    # Para gestores, devolver su primer campus
    campus = (
        db.query(Campus)
        .filter(Campus.usuario_id == usuario.id)
        .first()
    )

    if not campus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tienes un campus registrado. Crea uno primero.",
        )

    return campus