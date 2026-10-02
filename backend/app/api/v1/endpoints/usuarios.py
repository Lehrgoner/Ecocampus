from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional

from app.core.database import get_db
from app.models.usuario import Usuario
from app.api.deps import get_current_admin
from app.schemas.auth import UsuarioActualResponse

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


class AprobarUsuarioRequest(BaseModel):
    rol: str = Field(..., description="Rol a asignar: gestor o consultor")
    
    @classmethod
    def validar_rol(cls, v):
        if v not in ("gestor", "consultor"):
            raise ValueError("El rol debe ser 'gestor' o 'consultor'")
        return v


class CrearUsuarioRequest(BaseModel):
    cedula: str
    nombres: str
    apellidos: str
    email: str
    password: str
    rol: str = Field(..., description="admin, gestor o consultor")


@router.get("/", response_model=List[UsuarioActualResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin),
):
    """Lista todos los usuarios. Solo Admin."""
    return db.query(Usuario).order_by(Usuario.creado_en.desc()).all()


@router.get("/pendientes", response_model=List[UsuarioActualResponse])
def listar_pendientes(
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin),
):
    """Lista usuarios pendientes de aprobación. Solo Admin."""
    return (
        db.query(Usuario)
        .filter(Usuario.rol == "pendiente")
        .order_by(Usuario.creado_en.desc())
        .all()
    )


@router.post("/{usuario_id}/aprobar", response_model=UsuarioActualResponse)
def aprobar_usuario(
    usuario_id: int,
    datos: AprobarUsuarioRequest,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin),
):
    """Aprueba un usuario pendiente y le asigna un rol."""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if usuario.rol != "pendiente":
        raise HTTPException(status_code=400, detail="Este usuario no está pendiente")
    
    if datos.rol not in ("gestor", "consultor"):
        raise HTTPException(
            status_code=400, 
            detail="El rol debe ser 'gestor' o 'consultor'"
        )
    
    from datetime import datetime, timezone
    
    usuario.rol = datos.rol
    usuario.activo = True
    usuario.aprobado_por = admin.id
    usuario.aprobado_en = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(usuario)
    return usuario


@router.post("/{usuario_id}/rechazar", status_code=status.HTTP_204_NO_CONTENT)
def rechazar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin),
):
    """Rechaza y elimina un usuario pendiente."""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if usuario.rol != "pendiente":
        raise HTTPException(status_code=400, detail="Solo se pueden rechazar usuarios pendientes")
    
    db.delete(usuario)
    db.commit()
    return None


@router.post("/", response_model=UsuarioActualResponse, status_code=status.HTTP_201_CREATED)
def crear_usuario_directo(
    datos: CrearUsuarioRequest,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin),
):
    """
    Admin crea un usuario directamente con rol asignado y activo.
    """
    from app.core.security import hash_password
    
    if datos.rol not in ("admin", "gestor", "consultor"):
        raise HTTPException(
            status_code=400,
            detail="Rol inválido. Debe ser: admin, gestor o consultor"
        )
    
    if db.query(Usuario).filter(Usuario.email == datos.email).first():
        raise HTTPException(status_code=400, detail="Ya existe un usuario con ese email")
    
    if db.query(Usuario).filter(Usuario.cedula == datos.cedula).first():
        raise HTTPException(status_code=400, detail="Ya existe un usuario con esa cédula")
    
    nuevo = Usuario(
        cedula=datos.cedula,
        nombres=datos.nombres,
        apellidos=datos.apellidos,
        email=datos.email,
        password_hash=hash_password(datos.password),
        rol=datos.rol,
        activo=True,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/{usuario_id}", response_model=UsuarioActualResponse)
def actualizar_usuario(
    usuario_id: int,
    rol: Optional[str] = None,
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin),
):
    """Actualiza el rol o el estado activo de un usuario."""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if rol is not None:
        if rol not in ("admin", "gestor", "consultor"):
            raise HTTPException(status_code=400, detail="Rol inválido")
        usuario.rol = rol
    
    if activo is not None:
        usuario.activo = activo
    
    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin),
):
    """Elimina un usuario. Solo Admin."""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if usuario.id == admin.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    
    db.delete(usuario)
    db.commit()
    return None