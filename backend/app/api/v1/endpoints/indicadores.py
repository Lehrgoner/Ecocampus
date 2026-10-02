from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.campus import Campus
from app.models.zona_verde import ZonaVerde
from app.models.checklist import Checklist
from app.models.usuario import Usuario
from app.services.motor_reglas import calcular_todos_indicadores
from app.schemas.indicadores import IndicadoresResponse, IndicadorSI
from app.api.deps import get_current_user

router = APIRouter(prefix="/indicadores", tags=["Indicadores"])


@router.get("/actuales", response_model=IndicadoresResponse)
def obtener_indicadores_actuales(
    campus_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    """Calcula y devuelve los indicadores SI 1-8 actuales de un campus."""
    campus = db.query(Campus).filter(Campus.id == campus_id).first()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")
    
    # Verificar acceso
    if usuario.rol != "admin" and campus.usuario_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este campus",
        )
    
    checklist = db.query(Checklist).filter(Checklist.campus_id == campus_id).first()
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
    
    puntajes = calcular_todos_indicadores(
        area_espacio_abierto_m2=area_abierta,
        area_bosque_academico_m2=area_bosque,
        area_vegetacion_plantada_m2=area_plantada,
        area_total_campus_m2=campus.area_total_m2,
        poblacion_total=campus.poblacion_total,
        checklist=checklist,
    )
    
    indicadores = [
        IndicadorSI(codigo="SI1", nombre="Proporción de espacio abierto",
                    puntaje=puntajes["SI1"], puntaje_maximo=200.0,
                    porcentaje=(puntajes["SI1"] / 200.0) * 100),
        IndicadorSI(codigo="SI2", nombre="Vegetación forestal académica",
                    puntaje=puntajes["SI2"], puntaje_maximo=100.0,
                    porcentaje=(puntajes["SI2"] / 100.0) * 100),
        IndicadorSI(codigo="SI3", nombre="Vegetación plantada",
                    puntaje=puntajes["SI3"], puntaje_maximo=200.0,
                    porcentaje=(puntajes["SI3"] / 200.0) * 100),
        IndicadorSI(codigo="SI4", nombre="Espacio abierto por persona",
                    puntaje=puntajes["SI4"], puntaje_maximo=200.0,
                    porcentaje=(puntajes["SI4"] / 200.0) * 100),
        IndicadorSI(codigo="SI5", nombre="Discapacidad y maternidad",
                    puntaje=puntajes["SI5"], puntaje_maximo=100.0,
                    porcentaje=(puntajes["SI5"] / 100.0) * 100),
        IndicadorSI(codigo="SI6", nombre="Seguridad y protección",
                    puntaje=puntajes["SI6"], puntaje_maximo=100.0,
                    porcentaje=(puntajes["SI6"] / 100.0) * 100),
        IndicadorSI(codigo="SI7", nombre="Salud y bienestar",
                    puntaje=puntajes["SI7"], puntaje_maximo=100.0,
                    porcentaje=(puntajes["SI7"] / 100.0) * 100),
        IndicadorSI(codigo="SI8", nombre="Conservación flora y fauna",
                    puntaje=puntajes["SI8"], puntaje_maximo=100.0,
                    porcentaje=(puntajes["SI8"] / 100.0) * 100),
    ]
    
    return IndicadoresResponse(
        indicadores=indicadores,
        puntaje_total_si=puntajes["total"],
        puntaje_maximo_si=1100.0,
        porcentaje_total=(puntajes["total"] / 1100.0) * 100,
    )