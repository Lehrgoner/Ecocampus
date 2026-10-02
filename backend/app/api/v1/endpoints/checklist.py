from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.checklist import Checklist
from app.models.campus import Campus
from app.models.usuario import Usuario
from app.schemas.checklist import ChecklistCreate, ChecklistUpdate, ChecklistResponse
from app.api.deps import get_current_user, get_current_gestor

router = APIRouter(prefix="/checklist", tags=["Checklist"])


def verificar_acceso_campus(campus_id: int, usuario: Usuario, db: Session) -> Campus:
    """Verifica que el usuario tenga acceso al campus."""
    campus = db.query(Campus).filter(Campus.id == campus_id).first()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")
    
    if usuario.rol != "admin" and campus.usuario_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este campus",
        )
    return campus


@router.get("/", response_model=ChecklistResponse)
def obtener_checklist(
    campus_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    """Obtiene el checklist de un campus. Si no existe, lo crea vacío."""
    verificar_acceso_campus(campus_id, usuario, db)
    
    checklist = db.query(Checklist).filter(Checklist.campus_id == campus_id).first()
    if not checklist:
        checklist = Checklist(campus_id=campus_id)
        db.add(checklist)
        db.commit()
        db.refresh(checklist)
    return checklist


@router.put("/", response_model=ChecklistResponse)
def actualizar_checklist(
    checklist_data: ChecklistCreate,
    campus_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_gestor),
):
    """Actualiza el checklist de un campus."""
    verificar_acceso_campus(campus_id, usuario, db)
    
    checklist = db.query(Checklist).filter(Checklist.campus_id == campus_id).first()
    if not checklist:
        checklist = Checklist(campus_id=campus_id, **checklist_data.model_dump())
        db.add(checklist)
    else:
        for campo, valor in checklist_data.model_dump().items():
            setattr(checklist, campo, valor)
    
    db.commit()
    db.refresh(checklist)
    return checklist


@router.patch("/", response_model=ChecklistResponse)
def actualizar_checklist_parcial(
    checklist_data: ChecklistUpdate,
    campus_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_gestor),
):
    """Actualiza parcialmente el checklist."""
    verificar_acceso_campus(campus_id, usuario, db)
    
    checklist = db.query(Checklist).filter(Checklist.campus_id == campus_id).first()
    if not checklist:
        checklist = Checklist(campus_id=campus_id)
        db.add(checklist)
    
    for campo, valor in checklist_data.model_dump(exclude_unset=True).items():
        setattr(checklist, campo, valor)
    
    db.commit()
    db.refresh(checklist)
    return checklist