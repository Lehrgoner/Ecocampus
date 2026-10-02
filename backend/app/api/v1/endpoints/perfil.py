from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.campus import Campus
from app.models.perfil_sostenibilidad import PerfilSostenibilidad
from app.models.usuario import Usuario
from app.schemas.perfil_sostenibilidad import (
    PerfilSostenibilidadUpdate,
    PerfilSostenibilidadResponse,
)
from app.api.deps import get_current_user, get_current_gestor

router = APIRouter(prefix="/perfil", tags=["Perfil de Sostenibilidad"])


def verificar_acceso_campus(campus_id: int, usuario: Usuario, db: Session) -> Campus:
    campus = db.query(Campus).filter(Campus.id == campus_id).first()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")
    
    if usuario.rol != "admin" and campus.usuario_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este campus",
        )
    return campus


@router.get("/", response_model=PerfilSostenibilidadResponse)
def obtener_perfil(
    campus_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    """Obtiene el perfil de sostenibilidad de un campus."""
    verificar_acceso_campus(campus_id, usuario, db)
    
    perfil = db.query(PerfilSostenibilidad).filter(
        PerfilSostenibilidad.campus_id == campus_id
    ).first()
    
    if not perfil:
        perfil = PerfilSostenibilidad(campus_id=campus_id)
        db.add(perfil)
        db.commit()
        db.refresh(perfil)
    return perfil


@router.put("/", response_model=PerfilSostenibilidadResponse)
def actualizar_perfil(
    perfil_data: PerfilSostenibilidadUpdate,
    campus_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_gestor),
):
    """Actualiza el perfil de sostenibilidad de un campus."""
    verificar_acceso_campus(campus_id, usuario, db)
    
    perfil = db.query(PerfilSostenibilidad).filter(
        PerfilSostenibilidad.campus_id == campus_id
    ).first()
    
    if not perfil:
        perfil = PerfilSostenibilidad(campus_id=campus_id)
        db.add(perfil)
    
    for campo, valor in perfil_data.model_dump(exclude_unset=True).items():
        setattr(perfil, campo, valor)
    
    db.commit()
    db.refresh(perfil)
    return perfil