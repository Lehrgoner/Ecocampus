from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2 import Geography
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping
import json

from app.core.database import get_db
from app.models.zona_verde import ZonaVerde
from app.models.campus import Campus
from app.models.usuario import Usuario
from app.schemas.zona_verde import ZonaVerdeCreate, ZonaVerdeUpdate, ZonaVerdeResponse
from app.api.deps import get_current_user, get_current_gestor

router = APIRouter(prefix="/zonas-verdes", tags=["Zonas Verdes"])


def zona_a_geojson(zona: ZonaVerde) -> dict:
    geom_shape = to_shape(zona.geom)
    geojson = mapping(geom_shape)
    return {
        "id": zona.id,
        "nombre": zona.nombre,
        "tipo": zona.tipo,
        "area_m2": zona.area_m2,
        "uso_academico": zona.uso_academico,
        "geom": geojson,
    }


def verificar_acceso_campus(
    campus_id: int,
    usuario: Usuario,
    db: Session,
) -> Campus:
    """Verifica que el usuario tenga acceso a ese campus."""
    campus = db.query(Campus).filter(Campus.id == campus_id).first()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")
    
    if usuario.rol != "admin" and campus.usuario_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este campus",
        )
    return campus


def calcular_area_m2(db: Session, geojson_str: str) -> float:
    """Calcula el área en m² de un GeoJSON usando PostGIS."""
    area = db.scalar(
        func.ST_Area(
            func.ST_GeomFromGeoJSON(geojson_str).cast(Geography)
        )
    )
    return area if area else 0.0


@router.get("/", response_model=list[ZonaVerdeResponse])
def listar_zonas_verdes(
    campus_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    """Lista las zonas verdes de un campus específico."""
    verificar_acceso_campus(campus_id, usuario, db)
    zonas = db.query(ZonaVerde).filter(ZonaVerde.campus_id == campus_id).all()
    return [zona_a_geojson(z) for z in zonas]


@router.get("/{zona_id}", response_model=ZonaVerdeResponse)
def obtener_zona_verde(
    zona_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    """Obtiene una zona verde específica."""
    zona = db.query(ZonaVerde).filter(ZonaVerde.id == zona_id).first()
    if not zona:
        raise HTTPException(status_code=404, detail="Zona verde no encontrada")
    
    verificar_acceso_campus(zona.campus_id, usuario, db)
    return zona_a_geojson(zona)


@router.post("/", response_model=ZonaVerdeResponse, status_code=status.HTTP_201_CREATED)
def crear_zona_verde(
    zona_data: ZonaVerdeCreate,
    campus_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_gestor),
):
    """Crea una nueva zona verde en un campus."""
    verificar_acceso_campus(campus_id, usuario, db)
    
    geojson_str = json.dumps(zona_data.geom)
    
    # Solo los bosques pueden tener uso_academico
    uso_academico = zona_data.uso_academico if zona_data.tipo == "bosque_academico" else False
    
    nueva_zona = ZonaVerde(
        campus_id=campus_id,
        nombre=zona_data.nombre,
        tipo=zona_data.tipo,
        area_m2=zona_data.area_m2,
        uso_academico=uso_academico,
        geom=func.ST_GeomFromGeoJSON(geojson_str),
    )
    
    # Calcular área automáticamente si no se proporcionó
    if nueva_zona.area_m2 is None:
        nueva_zona.area_m2 = calcular_area_m2(db, geojson_str)
    
    db.add(nueva_zona)
    db.commit()
    db.refresh(nueva_zona)
    return zona_a_geojson(nueva_zona)


@router.put("/{zona_id}", response_model=ZonaVerdeResponse)
def actualizar_zona_verde(
    zona_id: int,
    zona_data: ZonaVerdeUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_gestor),
):
    """Actualiza una zona verde."""
    zona = db.query(ZonaVerde).filter(ZonaVerde.id == zona_id).first()
    if not zona:
        raise HTTPException(status_code=404, detail="Zona verde no encontrada")
    
    verificar_acceso_campus(zona.campus_id, usuario, db)
    
    datos = zona_data.model_dump(exclude_unset=True)
    
    # Si se cambia la geometría, recalcular área
    if "geom" in datos:
        geojson_str = json.dumps(datos.pop("geom"))
        zona.geom = func.ST_GeomFromGeoJSON(geojson_str)
        zona.area_m2 = calcular_area_m2(db, geojson_str)
    
    # Solo los bosques pueden tener uso_academico
    if "uso_academico" in datos:
        tipo_actual = datos.get("tipo", zona.tipo)
        if tipo_actual != "bosque_academico":
            datos["uso_academico"] = False
    
    for campo, valor in datos.items():
        setattr(zona, campo, valor)
    
    db.commit()
    db.refresh(zona)
    return zona_a_geojson(zona)


@router.delete("/{zona_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_zona_verde(
    zona_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_gestor),
):
    """Elimina una zona verde."""
    zona = db.query(ZonaVerde).filter(ZonaVerde.id == zona_id).first()
    if not zona:
        raise HTTPException(status_code=404, detail="Zona verde no encontrada")
    
    verificar_acceso_campus(zona.campus_id, usuario, db)
    
    db.delete(zona)
    db.commit()
    return None