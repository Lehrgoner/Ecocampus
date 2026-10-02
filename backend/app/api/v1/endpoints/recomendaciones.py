from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.models.campus import Campus
from app.models.zona_verde import ZonaVerde
from app.models.checklist import Checklist
from app.models.perfil_sostenibilidad import PerfilSostenibilidad
from app.models.usuario import Usuario
from app.services.recomendador import (
    generar_recomendaciones,
    calcular_area_minima_para_avanzar,
)
from app.services.predictor_ranking import predecir_ranking
from app.services.motor_reglas import calcular_todos_indicadores
from app.api.deps import get_current_user

router = APIRouter(prefix="/recomendaciones", tags=["Recomendaciones"])


class RecomendacionItem(BaseModel):
    tipo: str
    area_m2: float
    costo_estimado_usd: float
    descripcion: str
    puntaje_si_actual: float
    puntaje_si_nuevo: float
    ganancia_si: float
    porcentaje_ganancia_si: float
    ranking_predicho: int
    posiciones_mejoradas: int


class AreaMinimaItem(BaseModel):
    indicador: str
    valor_actual: float
    porcentaje_actual: float
    siguiente_rango_pct: float
    area_adicional_m2: float
    ganancia_puntaje_si: float
    multiplicador_actual: float
    multiplicador_siguiente: float


class RecomendacionesResponse(BaseModel):
    ranking_actual: int
    puntaje_si_actual: float
    presupuesto_usado: Optional[float]
    total_recomendaciones: int
    recomendaciones: List[RecomendacionItem]
    areas_minimas_para_avanzar: List[AreaMinimaItem]


@router.get("/", response_model=RecomendacionesResponse)
def obtener_recomendaciones(
    campus_id: int,
    presupuesto_max: Optional[float] = Query(None),
    top_n: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    """Genera recomendaciones para un campus específico."""
    campus = db.query(Campus).filter(Campus.id == campus_id).first()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")
    
    if usuario.rol != "admin" and campus.usuario_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este campus",
        )
    
    checklist = db.query(Checklist).filter(Checklist.campus_id == campus_id).first()
    perfil = db.query(PerfilSostenibilidad).filter(
        PerfilSostenibilidad.campus_id == campus_id
    ).first()
    
    if not perfil:
        perfil = PerfilSostenibilidad(campus_id=campus_id)
        db.add(perfil)
        db.commit()
        db.refresh(perfil)
    
    zonas = db.query(ZonaVerde).filter(ZonaVerde.campus_id == campus_id).all()
    area_abierta = sum(z.area_m2 or 0 for z in zonas)
    area_bosque = sum(
        z.area_m2 or 0 for z in zonas 
        if z.tipo == "bosque_academico" and z.uso_academico
    )
    area_plantada = sum(
        z.area_m2 or 0 for z in zonas
        if z.tipo in ("vegetacion_plantada", "cesped", "jardin")
    )
    
    puntajes_otras = {
        "EC": perfil.energia_clima,
        "WS": perfil.residuos,
        "WR": perfil.agua,
        "TR": perfil.transporte,
        "ED": perfil.educacion_investigacion,
    }
    
    puntajes_si = calcular_todos_indicadores(
        area_espacio_abierto_m2=area_abierta,
        area_bosque_academico_m2=area_bosque,
        area_vegetacion_plantada_m2=area_plantada,
        area_total_campus_m2=campus.area_total_m2,
        poblacion_total=campus.poblacion_total,
        checklist=checklist,
    )
    
    try:
        ranking_actual = predecir_ranking({"SI": puntajes_si["total"], **puntajes_otras})
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error ML: {str(e)}")
    
    areas_minimas = []
    for ind, area_actual in [
        ("SI1", area_abierta), ("SI2", area_bosque),
        ("SI3", area_plantada), ("SI4", area_abierta),
    ]:
        resultado = calcular_area_minima_para_avanzar(
            indicador=ind,
            valor_actual=area_actual,
            area_total_campus=campus.area_total_m2,
            poblacion=campus.poblacion_total,
        )
        if resultado:
            areas_minimas.append(AreaMinimaItem(**resultado))
    
    recomendaciones = generar_recomendaciones(
        area_actual_abierta=area_abierta,
        area_actual_bosque=area_bosque,
        area_actual_plantada=area_plantada,
        area_total_campus=campus.area_total_m2,
        poblacion=campus.poblacion_total,
        checklist=checklist,
        puntajes_otras_categorias=puntajes_otras,
        presupuesto_max=presupuesto_max,
        top_n=top_n,
    )
    
    recomendaciones_con_porcentaje = []
    for rec in recomendaciones:
        puntaje_actual = rec["puntaje_si_actual"]
        ganancia = rec["ganancia_si"]
        porcentaje = (ganancia / puntaje_actual * 100) if puntaje_actual > 0 else 0.0
        
        recomendaciones_con_porcentaje.append(
            RecomendacionItem(**rec, porcentaje_ganancia_si=round(porcentaje, 2))
        )
    
    return RecomendacionesResponse(
        ranking_actual=ranking_actual,
        puntaje_si_actual=round(puntajes_si["total"], 2),
        presupuesto_usado=presupuesto_max,
        total_recomendaciones=len(recomendaciones_con_porcentaje),
        recomendaciones=recomendaciones_con_porcentaje,
        areas_minimas_para_avanzar=areas_minimas,
    )