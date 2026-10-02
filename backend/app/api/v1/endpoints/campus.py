from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.campus import Campus
from app.models.usuario import Usuario
from app.schemas.campus import CampusCreate, CampusUpdate, CampusResponse
from app.api.deps import get_current_user, get_current_admin, get_current_gestor

router = APIRouter(prefix="/campus", tags=["Campus"])


@router.get("/", response_model=List[CampusResponse])
def listar_campus(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    """
    Lista los campus del usuario autenticado.
    - Admin: ve TODOS los campus del sistema
    - Gestor/Consultor: solo ve sus campus
    """
    if usuario.rol == "admin":
        return db.query(Campus).all()
    
    return db.query(Campus).filter(Campus.usuario_id == usuario.id).all()


@router.get("/actual", response_model=CampusResponse)
def obtener_campus_actual(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    """
    Obtiene el primer campus del usuario autenticado.
    """
    campus = (
        db.query(Campus)
        .filter(Campus.usuario_id == usuario.id)
        .first()
    )
    
    if not campus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tienes campus registrado. Crea uno con POST /campus/",
        )
    
    return campus


@router.post("/", response_model=CampusResponse, status_code=status.HTTP_201_CREATED)
def crear_campus(
    campus_data: CampusCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_gestor),
):
    """
    Crea un nuevo campus asociado al usuario autenticado.
    Solo Gestor y Admin.
    """
    nuevo_campus = Campus(
        **campus_data.model_dump(),
        usuario_id=usuario.id,
    )
    db.add(nuevo_campus)
    db.commit()
    db.refresh(nuevo_campus)
    return nuevo_campus


@router.put("/{campus_id}", response_model=CampusResponse)
def actualizar_campus(
    campus_id: int,
    campus_data: CampusUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_gestor),
):
    """
    Actualiza un campus específico.
    - Admin: puede actualizar cualquier campus
    - Gestor: solo los suyos
    """
    campus = db.query(Campus).filter(Campus.id == campus_id).first()
    
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")
    
    if usuario.rol != "admin" and campus.usuario_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este campus",
        )
    
    for campo, valor in campus_data.model_dump(exclude_unset=True).items():
        setattr(campus, campo, valor)
    
    db.commit()
    db.refresh(campus)
    return campus


@router.delete("/{campus_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_campus(
    campus_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_gestor),
):
    """
    Elimina un campus específico.
    - Admin: puede eliminar cualquier campus
    - Gestor: solo los suyos
    """
    campus = db.query(Campus).filter(Campus.id == campus_id).first()
    
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")
    
    if usuario.rol != "admin" and campus.usuario_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este campus",
        )
    
    db.delete(campus)
    db.commit()
    return None