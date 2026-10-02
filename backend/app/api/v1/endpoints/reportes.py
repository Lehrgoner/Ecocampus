from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json

from app.core.database import get_db
from app.models.campus import Campus
from app.models.zona_verde import ZonaVerde
from app.models.checklist import Checklist
from app.models.perfil_sostenibilidad import PerfilSostenibilidad
from app.models.simulacion import Simulacion
from app.models.usuario import Usuario
from app.services.motor_reglas import (
    calcular_todos_indicadores,
    calcular_nivel_si5_desde_checklist,
    calcular_nivel_si6_desde_checklist,
    calcular_nivel_si7_desde_checklist,
    calcular_nivel_si8_desde_checklist,
)
from app.services.predictor_ranking import predecir_ranking
from app.services.recomendador import (
    generar_recomendaciones,
    calcular_area_minima_para_avanzar,
)
from app.services.reportes_pdf import generar_reporte_pdf
from app.api.deps import get_current_user

router = APIRouter(prefix="/reportes", tags=["Reportes"])


def verificar_acceso_campus(campus_id: int, usuario: Usuario, db: Session) -> Campus:
    """Verifica que el usuario tenga acceso al campus."""
    campus = db.query(Campus).filter(Campus.id == campus_id).first()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus no encontrado")

    if usuario.rol != "admin" and campus.usuario_id != usuario.id:
        raise HTTPException(status_code=403, detail="Sin acceso al campus")

    return campus


def _recolectar_datos(campus_id: int, usuario: Usuario, db: Session):
    """Recolecta todos los datos necesarios para el reporte."""
    campus = verificar_acceso_campus(campus_id, usuario, db)
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

    puntajes = calcular_todos_indicadores(
        area_espacio_abierto_m2=area_abierta,
        area_bosque_academico_m2=area_bosque,
        area_vegetacion_plantada_m2=area_plantada,
        area_total_campus_m2=campus.area_total_m2,
        poblacion_total=campus.poblacion_total,
        checklist=checklist,
    )

    # Indicadores en formato de lista
    nombres = {
        "SI1": "Proporción de espacio abierto",
        "SI2": "Vegetación forestal académica",
        "SI3": "Vegetación plantada",
        "SI4": "Espacio abierto por persona",
        "SI5": "Discapacidad y maternidad",
        "SI6": "Seguridad y protección",
        "SI7": "Salud y bienestar",
        "SI8": "Conservación flora y fauna",
    }
    maximos = {
        "SI1": 200, "SI2": 100, "SI3": 200, "SI4": 200,
        "SI5": 100, "SI6": 100, "SI7": 100, "SI8": 100,
    }

    indicadores = []
    for codigo in nombres:
        puntaje = puntajes[codigo]
        maximo = maximos[codigo]
        indicadores.append({
            "codigo": codigo,
            "nombre": nombres[codigo],
            "puntaje": puntaje,
            "puntaje_maximo": float(maximo),
            "porcentaje": (puntaje / maximo * 100) if maximo > 0 else 0,
        })

    # Categorías para radar
    puntajes_categorias = {
        "SI": puntajes["total"],
        "EC": perfil.energia_clima,
        "WS": perfil.residuos,
        "WR": perfil.agua,
        "TR": perfil.transporte,
        "ED": perfil.educacion_investigacion,
    }

    # Zonas por tipo
    zonas_por_tipo = {}
    for z in zonas:
        tipo = z.tipo
        zonas_por_tipo[tipo] = zonas_por_tipo.get(tipo, 0) + (z.area_m2 or 0)

    # Ranking estimado
    try:
        ranking = predecir_ranking({
            "SI": puntajes["total"],
            "EC": perfil.energia_clima,
            "WS": perfil.residuos,
            "WR": perfil.agua,
            "TR": perfil.transporte,
            "ED": perfil.educacion_investigacion,
        })
    except Exception:
        ranking = None

    # Recomendaciones
    puntajes_otras = {
        "EC": perfil.energia_clima,
        "WS": perfil.residuos,
        "WR": perfil.agua,
        "TR": perfil.transporte,
        "ED": perfil.educacion_investigacion,
    }

    recomendaciones = generar_recomendaciones(
        area_actual_abierta=area_abierta,
        area_actual_bosque=area_bosque,
        area_actual_plantada=area_plantada,
        area_total_campus=campus.area_total_m2,
        poblacion=campus.poblacion_total,
        checklist=checklist,
        puntajes_otras_categorias=puntajes_otras,
        presupuesto_max=100000,
        top_n=5,
    )

    # Agregar porcentaje de ganancia
    for rec in recomendaciones:
        puntaje_actual = rec.get("puntaje_si_actual", 0)
        ganancia = rec.get("ganancia_si", 0)
        rec["porcentaje_ganancia_si"] = (
            (ganancia / puntaje_actual * 100) if puntaje_actual > 0 else 0.0
        )

    # Resumen de checklist (mejorado)
    from app.services.motor_reglas import obtener_resumen_checklist
    checklist_resumen = obtener_resumen_checklist(checklist) if checklist else {}

    # Historial de simulaciones (últimas 10)
    simulaciones_db = (
        db.query(Simulacion)
        .filter(Simulacion.campus_id == campus_id)
        .order_by(Simulacion.creado_en.desc())
        .limit(10)
        .all()
    )

    simulaciones = []
    for sim in simulaciones_db:
        simulaciones.append({
            "id": sim.id,
            "tipo_intervencion": sim.tipo_intervencion,
            "area_m2": sim.area_m2,
            "puntajes_antes": json.loads(sim.puntajes_antes) if sim.puntajes_antes else {},
            "puntajes_despues": json.loads(sim.puntajes_despues) if sim.puntajes_despues else {},
            "creado_en": sim.creado_en.isoformat() if sim.creado_en else "",
        })

    # Áreas mínimas para avanzar
    areas_minimas = []
    for ind, area_actual in [
        ("SI1", area_abierta),
        ("SI2", area_bosque),
        ("SI3", area_plantada),
        ("SI4", area_abierta),
    ]:
        resultado = calcular_area_minima_para_avanzar(
            indicador=ind,
            valor_actual=area_actual,
            area_total_campus=campus.area_total_m2,
            poblacion=campus.poblacion_total,
        )
        if resultado:
            areas_minimas.append(resultado)

    return {
        "campus": campus,
        "indicadores": indicadores,
        "puntajes_categorias": puntajes_categorias,
        "zonas_por_tipo": zonas_por_tipo,
        "recomendaciones": recomendaciones,
        "checklist_resumen": checklist_resumen,
        "ranking_estimado": ranking,
        "simulaciones": simulaciones,
        "areas_minimas": areas_minimas,
    }


@router.get("/datos-graficos")
def obtener_datos_graficos(
    campus_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    """
    Devuelve todos los datos necesarios para que el frontend dibuje los gráficos.
    """
    datos = _recolectar_datos(campus_id, usuario, db)

    return {
        "campus": {
            "nombre": datos["campus"].nombre,
            "area_total_m2": datos["campus"].area_total_m2,
            "poblacion_total": datos["campus"].poblacion_total,
        },
        "indicadores": datos["indicadores"],
        "radar_categorias": datos["puntajes_categorias"],
        "zonas_por_tipo": datos["zonas_por_tipo"],
        "recomendaciones": datos["recomendaciones"],
        "ranking_estimado": datos["ranking_estimado"],
        "checklist_resumen": datos["checklist_resumen"],
        "simulaciones": datos["simulaciones"],
        "areas_minimas": datos["areas_minimas"],
    }


@router.get("/pdf")
def descargar_reporte_pdf(
    campus_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    """
    Genera y descarga un reporte PDF completo del campus.
    """
    datos = _recolectar_datos(campus_id, usuario, db)

    pdf_bytes = generar_reporte_pdf(
        campus=datos["campus"],
        indicadores=datos["indicadores"],
        puntajes_categorias=datos["puntajes_categorias"],
        zonas_por_tipo=datos["zonas_por_tipo"],
        recomendaciones=datos["recomendaciones"],
        checklist_resumen=datos["checklist_resumen"],
        areas_minimas=datos["areas_minimas"],
        simulaciones=datos["simulaciones"],
        ranking_estimado=datos["ranking_estimado"],
    )

    nombre_archivo = f"reporte_{datos['campus'].nombre.replace(' ', '_')}.pdf"

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={nombre_archivo}"},
    )