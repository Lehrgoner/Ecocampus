"""
Sistema de Recomendación basado en áreas mínimas exactas con variantes.
Genera múltiples opciones por indicador (50%, 100%, 150%, 200% del área mínima).
"""

from typing import List, Dict, Optional

from app.services.motor_reglas import calcular_todos_indicadores
from app.services.predictor_ranking import predecir_ranking


TIPOS_INTERVENCION = {
    "bosque_academico": {
        "costo_por_m2": 8.0,
        "descripcion": "Bosque con fines academicos (investigacion, docencia)",
    },
    "vegetacion_plantada": {
        "costo_por_m2": 5.0,
        "descripcion": "Jardines, cesped, arbustos ornamentales",
    },
    "jardin_lluvia": {
        "costo_por_m2": 15.0,
        "descripcion": "Jardin de absorcion de agua de lluvia",
    },
    "cesped": {
        "costo_por_m2": 3.0,
        "descripcion": "Cesped y areas verdes de bajo mantenimiento",
    },
}


RANGOS_SI = {
    "SI1": [1, 80, 90, 95],
    "SI2": [2, 10, 25, 35],
    "SI3": [10, 20, 30, 50],
    "SI4": [10, 20, 40, 70],
}

MULTIPLICADORES = {0: 0.05, 1: 0.25, 2: 0.50, 3: 0.75, 4: 1.00}
MAXIMOS = {"SI1": 200, "SI2": 100, "SI3": 200, "SI4": 200}

TIPOS_QUE_AFECTAN = {
    "SI1": ["cesped", "vegetacion_plantada", "bosque_academico", "jardin_lluvia"],
    "SI2": ["bosque_academico"],
    "SI3": ["cesped", "vegetacion_plantada"],
    "SI4": ["cesped", "vegetacion_plantada", "bosque_academico", "jardin_lluvia"],
}


def calcular_area_minima_para_avanzar(
    indicador: str,
    valor_actual: float,
    area_total_campus: float,
    poblacion: int,
) -> Optional[Dict]:
    """Calcula el área mínima para que un indicador suba al siguiente rango."""
    if indicador not in RANGOS_SI:
        return None

    rangos = RANGOS_SI[indicador]

    if indicador == "SI4":
        valor_actual_pct = valor_actual / poblacion if poblacion > 0 else 0
    else:
        valor_actual_pct = (valor_actual / area_total_campus) * 100 if area_total_campus > 0 else 0

    siguiente_rango = None
    for r in rangos:
        if valor_actual_pct < r:
            siguiente_rango = r
            break

    if siguiente_rango is None:
        return None

    if indicador == "SI4":
        valor_necesario_m2 = siguiente_rango * poblacion
    else:
        valor_necesario_m2 = (siguiente_rango / 100) * area_total_campus

    area_adicional = valor_necesario_m2 - valor_actual

    mult_actual = 0.05
    for i, r in enumerate(rangos):
        if valor_actual_pct < r:
            break
        mult_actual = MULTIPLICADORES[min(i + 1, 4)]

    idx_actual = 0
    for i, r in enumerate(rangos):
        if valor_actual_pct <= r:
            idx_actual = i
            break
    else:
        idx_actual = len(rangos) - 1

    mult_siguiente = MULTIPLICADORES[min(idx_actual + 1, 4)]
    ganancia_puntaje = (mult_siguiente - mult_actual) * MAXIMOS[indicador]

    return {
        "indicador": indicador,
        "valor_actual": round(valor_actual, 2),
        "porcentaje_actual": round(valor_actual_pct, 2),
        "siguiente_rango_pct": siguiente_rango,
        "area_adicional_m2": round(area_adicional, 2),
        "ganancia_puntaje_si": round(ganancia_puntaje, 2),
        "multiplicador_actual": mult_actual,
        "multiplicador_siguiente": mult_siguiente,
    }


def _calcular_areas_segun_tipo(
    tipo: str,
    area_intervencion: float,
    area_actual_abierta: float,
    area_actual_bosque: float,
    area_actual_plantada: float,
):
    """Proyecta las áreas del campus después de la intervención."""
    nueva_abierta = area_actual_abierta + area_intervencion
    nueva_bosque = area_actual_bosque
    nueva_plantada = area_actual_plantada

    if tipo == "bosque_academico":
        nueva_bosque += area_intervencion
    elif tipo in ("vegetacion_plantada", "cesped"):
        nueva_plantada += area_intervencion

    return nueva_abierta, nueva_bosque, nueva_plantada


def _construir_recomendacion(
    tipo: str,
    area_intervencion: float,
    indicador_objetivo: str,
    area_actual_abierta: float,
    area_actual_bosque: float,
    area_actual_plantada: float,
    area_total_campus: float,
    poblacion: int,
    checklist,
    ranking_actual: int,
    puntajes_otras: Dict,
) -> Optional[Dict]:
    """Construye una recomendación con área exacta."""
    if area_intervencion <= 0:
        return None

    config = TIPOS_INTERVENCION[tipo]
    costo = area_intervencion * config["costo_por_m2"]

    puntajes_antes = calcular_todos_indicadores(
        area_espacio_abierto_m2=area_actual_abierta,
        area_bosque_academico_m2=area_actual_bosque,
        area_vegetacion_plantada_m2=area_actual_plantada,
        area_total_campus_m2=area_total_campus,
        poblacion_total=poblacion,
        checklist=checklist,
    )

    nueva_abierta, nueva_bosque, nueva_plantada = _calcular_areas_segun_tipo(
        tipo, area_intervencion, area_actual_abierta, area_actual_bosque, area_actual_plantada
    )

    puntajes_despues = calcular_todos_indicadores(
        area_espacio_abierto_m2=nueva_abierta,
        area_bosque_academico_m2=nueva_bosque,
        area_vegetacion_plantada_m2=nueva_plantada,
        area_total_campus_m2=area_total_campus,
        poblacion_total=poblacion,
        checklist=checklist,
    )

    ganancia_si = puntajes_despues["total"] - puntajes_antes["total"]
    if ganancia_si <= 0:
        return None

    try:
        ranking_nuevo = predecir_ranking({
            "SI": puntajes_despues["total"],
            **puntajes_otras,
        })
    except Exception:
        ranking_nuevo = ranking_actual

    return {
        "tipo": tipo,
        "area_m2": round(area_intervencion, 2),
        "costo_estimado_usd": round(costo, 2),
        "descripcion": config["descripcion"],
        "indicador_objetivo": indicador_objetivo,
        "puntaje_si_actual": round(puntajes_antes["total"], 2),
        "puntaje_si_nuevo": round(puntajes_despues["total"], 2),
        "ganancia_si": round(ganancia_si, 2),
        "ranking_predicho": ranking_nuevo,
        "posiciones_mejoradas": ranking_actual - ranking_nuevo,
    }


def generar_recomendaciones(
    area_actual_abierta: float,
    area_actual_bosque: float,
    area_actual_plantada: float,
    area_total_campus: float,
    poblacion: int,
    checklist,
    puntajes_otras_categorias: Dict,
    presupuesto_max: Optional[float] = None,
    top_n: int = 5,
    **kwargs,
) -> List[Dict]:
    """
    Genera recomendaciones con múltiples variantes de área.
    """
    puntajes_actuales_si = calcular_todos_indicadores(
        area_espacio_abierto_m2=area_actual_abierta,
        area_bosque_academico_m2=area_actual_bosque,
        area_vegetacion_plantada_m2=area_actual_plantada,
        area_total_campus_m2=area_total_campus,
        poblacion_total=poblacion,
        checklist=checklist,
    )

    puntajes_ml_actuales = {"SI": puntajes_actuales_si["total"], **puntajes_otras_categorias}

    try:
        ranking_actual = predecir_ranking(puntajes_ml_actuales)
    except Exception:
        return []

    areas_actuales = {
        "SI1": area_actual_abierta,
        "SI2": area_actual_bosque,
        "SI3": area_actual_plantada,
        "SI4": area_actual_abierta,
    }

    recomendaciones = []

    # Para cada indicador y tipo, generar variantes
    for indicador, tipos in TIPOS_QUE_AFECTAN.items():
        area_min_info = calcular_area_minima_para_avanzar(
            indicador=indicador,
            valor_actual=areas_actuales[indicador],
            area_total_campus=area_total_campus,
            poblacion=poblacion,
        )

        if not area_min_info:
            continue

        area_base = area_min_info["area_adicional_m2"]

        # Variantes: 50%, 100%, 150%, 200%
        for factor in [0.5, 1.0, 1.5, 2.0]:
            area_variante = area_base * factor

            for tipo in tipos:
                rec = _construir_recomendacion(
                    tipo=tipo,
                    area_intervencion=area_variante,
                    indicador_objetivo=indicador,
                    area_actual_abierta=area_actual_abierta,
                    area_actual_bosque=area_actual_bosque,
                    area_actual_plantada=area_actual_plantada,
                    area_total_campus=area_total_campus,
                    poblacion=poblacion,
                    checklist=checklist,
                    ranking_actual=ranking_actual,
                    puntajes_otras=puntajes_otras_categorias,
                )
                if rec:
                    recomendaciones.append(rec)

    # Filtrar por presupuesto
    if presupuesto_max:
        recomendaciones = [
            r for r in recomendaciones
            if r["costo_estimado_usd"] <= presupuesto_max
        ]

    if not recomendaciones:
        return []

    # Eliminar duplicados exactos
    vistos = set()
    unicas = []
    for r in recomendaciones:
        key = (r["tipo"], r["indicador_objetivo"], round(r["area_m2"], 0))
        if key not in vistos:
            unicas.append(r)
            vistos.add(key)

    # Calcular eficiencia (ganancia / costo)
    for r in unicas:
        if r["costo_estimado_usd"] > 0:
            r["eficiencia"] = r["ganancia_si"] / r["costo_estimado_usd"] * 1000
        else:
            r["eficiencia"] = 0

    # Ordenar por eficiencia
    unicas.sort(key=lambda x: (x["eficiencia"], x["ganancia_si"]), reverse=True)

    # Diversidad: 1 por tipo
    por_tipo = {}
    for r in unicas:
        if r["tipo"] not in por_tipo:
            por_tipo[r["tipo"]] = []
        por_tipo[r["tipo"]].append(r)

    seleccionados = []
    for tipo in por_tipo:
        seleccionados.append(por_tipo[tipo][0])

    # Completar si sobran espacios
    if len(seleccionados) < top_n:
        ids_seleccionados = {(r["tipo"], round(r["area_m2"], 0)) for r in seleccionados}
        restantes = [
            r for r in unicas
            if (r["tipo"], round(r["area_m2"], 0)) not in ids_seleccionados
        ]
        seleccionados.extend(restantes[:top_n - len(seleccionados)])

    # Ordenar final por eficiencia
    seleccionados.sort(key=lambda x: (x["eficiencia"], x["ganancia_si"]), reverse=True)

    return seleccionados[:top_n]