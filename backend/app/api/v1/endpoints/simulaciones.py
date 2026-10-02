from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2 import Geography
import json

from app.core.database import get_db
from app.models.campus import Campus
from app.models.zona_verde import ZonaVerde
from app.models.checklist import Checklist
from app.models.simulacion import Simulacion
from app.models.usuario import Usuario
from app.services.motor_reglas import calcular_todos_indicadores
from app.schemas.simulacion import SimulacionRequest, SimulacionResponse
from app.api.deps import get_current_user, get_current_gestor

router = APIRouter(prefix="/simulaciones", tags=["Simulaciones"])


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


def calcular_areas_actuales(db: Session, campus_id: int):
    zonas = db.query(ZonaVerde).filter(ZonaVerde.campus_id == campus_id).all()
    area_bosque = sum(
        z.area_m2 or 0 for z in zonas
        if z.tipo == "bosque_academico" and z.uso_academico
    )
    area_plantada = sum(
        z.area_m2 or 0 for z in zonas
        if z.tipo in ("vegetacion_plantada", "cesped", "jardin")
    )
    area_abierta = sum(z.area_m2 or 0 for z in zonas)
    return area_abierta, area_bosque, area_plantada


def calcular_area_geojson(db: Session, geojson: dict) -> float:
    """Calcula el área en m² de un polígono GeoJSON usando PostGIS."""
    geojson_str = json.dumps(geojson)
    area = db.scalar(
        func.ST_Area(
            func.ST_GeomFromGeoJSON(geojson_str).cast(Geography)
        )
    )
    return area if area else 0.0


@router.post("/", response_model=SimulacionResponse, status_code=status.HTTP_201_CREATED)
def crear_simulacion(
    sim_data: SimulacionRequest,
    campus_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_gestor),
):
    """Simula una intervención en espacios verdes de un campus."""
    campus = verificar_acceso_campus(campus_id, usuario, db)
    checklist = db.query(Checklist).filter(Checklist.campus_id == campus_id).first()
    
    area_intervencion = calcular_area_geojson(db, sim_data.geom)
    if area_intervencion <= 0:
        raise HTTPException(
            status_code=400,
            detail="El polígono proporcionado tiene área inválida (0 m²).",
        )
    
    area_abierta_actual, area_bosque_actual, area_plantada_actual = calcular_areas_actuales(db, campus_id)
    
    puntajes_antes = calcular_todos_indicadores(
        area_espacio_abierto_m2=area_abierta_actual,
        area_bosque_academico_m2=area_bosque_actual,
        area_vegetacion_plantada_m2=area_plantada_actual,
        area_total_campus_m2=campus.area_total_m2,
        poblacion_total=campus.poblacion_total,
        checklist=checklist,
    )
    
    area_abierta_despues = area_abierta_actual + area_intervencion
    area_bosque_despues = area_bosque_actual
    area_plantada_despues = area_plantada_actual
    
    tipo = sim_data.tipo_intervencion.lower()
    
    if tipo == "bosque_academico":
        # Solo suma a SI 2 si es de uso académico
        if sim_data.uso_academico:
            area_bosque_despues += area_intervencion
    elif tipo in ("vegetacion_plantada", "cesped", "jardin"):
        area_plantada_despues += area_intervencion
    elif tipo == "jardin_lluvia":
        pass
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo '{sim_data.tipo_intervencion}' no válido.",
        )
    
    puntajes_despues = calcular_todos_indicadores(
        area_espacio_abierto_m2=area_abierta_despues,
        area_bosque_academico_m2=area_bosque_despues,
        area_vegetacion_plantada_m2=area_plantada_despues,
        area_total_campus_m2=campus.area_total_m2,
        poblacion_total=campus.poblacion_total,
        checklist=checklist,
    )
    
    nueva_sim = Simulacion(
        campus_id=campus_id,
        tipo_intervencion=sim_data.tipo_intervencion,
        area_m2=area_intervencion,
        geom_geojson=json.dumps(sim_data.geom),
        puntajes_antes=json.dumps(puntajes_antes),
        puntajes_despues=json.dumps(puntajes_despues),
    )
    db.add(nueva_sim)
    db.commit()
    db.refresh(nueva_sim)
    
    return SimulacionResponse(
        id=nueva_sim.id,
        tipo_intervencion=nueva_sim.tipo_intervencion,
        area_m2=nueva_sim.area_m2,
        puntajes_antes=puntajes_antes,
        puntajes_despues=puntajes_despues,
        ranking_antes=None,
        ranking_despues=None,
        creado_en=nueva_sim.creado_en,
    )


@router.get("/", response_model=list[SimulacionResponse])
def listar_simulaciones(
    campus_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    """Lista las simulaciones de un campus."""
    verificar_acceso_campus(campus_id, usuario, db)
    
    simulaciones = (
        db.query(Simulacion)
        .filter(Simulacion.campus_id == campus_id)
        .order_by(Simulacion.creado_en.desc())
        .all()
    )
    
    return [
        SimulacionResponse(
            id=sim.id,
            tipo_intervencion=sim.tipo_intervencion,
            area_m2=sim.area_m2,
            puntajes_antes=json.loads(sim.puntajes_antes) if sim.puntajes_antes else {},
            puntajes_despues=json.loads(sim.puntajes_despues) if sim.puntajes_despues else {},
            ranking_antes=None,
            ranking_despues=None,
            creado_en=sim.creado_en,
        )
        for sim in simulaciones
    ]


@router.get("/{sim_id}", response_model=SimulacionResponse)
def obtener_simulacion(
    sim_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    """Obtiene una simulación específica."""
    sim = db.query(Simulacion).filter(Simulacion.id == sim_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulación no encontrada")
    
    verificar_acceso_campus(sim.campus_id, usuario, db)
    
    return SimulacionResponse(
        id=sim.id,
        tipo_intervencion=sim.tipo_intervencion,
        area_m2=sim.area_m2,
        puntajes_antes=json.loads(sim.puntajes_antes) if sim.puntajes_antes else {},
        puntajes_despues=json.loads(sim.puntajes_despues) if sim.puntajes_despues else {},
        ranking_antes=None,
        ranking_despues=None,
        creado_en=sim.creado_en,
    )